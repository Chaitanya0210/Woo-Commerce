import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server } from '../mcp/server.js';
import { config } from '../config/index.js';
import { logger } from '../observability/logger.js';
import { tokenManager } from '../security/tokens.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const requestLog: Record<string, unknown>[] = [];
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    requestLog.unshift({
      time: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start
    });
    if (requestLog.length > 100) requestLog.pop();
  });
  next();
});

const mcpAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7);
    if (tokenManager.verify(token) || token === config.AGENT_AUTH_TOKEN) {
      return next();
    }
  }
  res.status(401).json({ error: 'Unauthorized' });
};

let mcpTransport: SSEServerTransport;

app.get('/mcp/sse', mcpAuth, async (req, res) => {
  mcpTransport = new SSEServerTransport('/mcp/messages', res);
  await server.connect(mcpTransport);
});

app.post('/mcp/messages', mcpAuth, async (req, res) => {
  if (mcpTransport) {
    await mcpTransport.handlePostMessage(req, res);
  } else {
    res.status(400).send('SSE not initialized');
  }
});

app.get('/api/admin/status', (req, res) => res.json({ status: 'ok' }));
app.get('/api/admin/logs', (req, res) => res.json(requestLog));
app.post('/api/admin/tokens', (req, res) => {
  const body = req.body as { name?: string };
  const raw = tokenManager.createToken(body.name || 'agent');
  res.json({ token: raw });
});

export function runHttp() {
  const port = config.ADMIN_PORT;
  app.listen(port, () => {
    logger.info(`HTTP Server running on port ${port}`);
  });
}
