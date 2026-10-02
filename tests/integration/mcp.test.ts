import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';

let mockServer: http.Server;
const port = 3998;
let currentScenario: 'success' | '401' | '404' | '429' | '503-recovery' | 'timeout' | 'malformed' | 'pagination' | 'pii-off' | 'pii-on' = 'success';
let requestCount = 0;
let serverMod: any;

beforeAll(async () => {
  process.env.WOO_URL = `http://localhost:${port}`;
  process.env.WOO_KEY = 'test_key';
  process.env.WOO_SECRET = 'test_secret';
  
  serverMod = await import('../../src/mcp/server.js');

  mockServer = http.createServer((req, res) => {
    requestCount++;
    
    if (currentScenario === '401') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 'woocommerce_rest_cannot_view', message: 'Sorry, you cannot list resources.' }));
    }
    
    if (currentScenario === '404') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ code: 'woocommerce_rest_term_invalid', message: 'Resource does not exist.' }));
    }
    
    if (currentScenario === '429') {
      res.writeHead(429, { 'Retry-After': '1', 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Rate limited' }));
    }

    if (currentScenario === '503-recovery') {
      if (requestCount === 1) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Service unavailable' }));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([{ id: 102 }]));
    }

    if (currentScenario === 'timeout') {
      res.socket?.destroy();
      return;
    }

    if (currentScenario === 'malformed') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('{"broken": "json"');
    }

    if (currentScenario === 'pagination') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-WP-Total': '15',
        'X-WP-TotalPages': '2'
      });
      return res.end(JSON.stringify([{ id: 101 }]));
    }

    if (currentScenario === 'pii-on' || currentScenario === 'pii-off' || currentScenario === 'success') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      
      const payload = req.url?.includes('products') 
        ? [{ id: 50, name: 'Test Product', sku: 'SKU-1', price: '10.00', stock_status: 'instock', stock_quantity: 100 }]
        : [{ id: 101, status: 'completed', total: '150.00', currency: 'USD', billing: { email: 'test@example.com', phone: '555-1234' } }];
        
      if (req.url?.includes('products/') && !req.url?.includes('?')) {
        return res.end(JSON.stringify(payload[0]));
      }
      if (req.url?.includes('orders/') && !req.url?.includes('?')) {
        return res.end(JSON.stringify(payload[0]));
      }
      return res.end(JSON.stringify(payload));
    }
  });
  
  mockServer.listen(port);
});

afterAll(() => {
  mockServer.close();
});

beforeEach(() => {
  requestCount = 0;
  currentScenario = 'success';
  process.env.ENABLE_PII = 'false';
  if (serverMod) {
    serverMod.client.breaker.reset();
    serverMod.client.cache.clear();
  }
});

async function callTool(name: string, args: any) {
  const tool = serverMod.server._registeredTools[name] || serverMod.server._tools?.[name] || serverMod.server._tools?.get?.(name);
  if (!tool) throw new Error(`Tool ${name} not found`);
  return tool.handler(args, {} as any);
}

describe('Integration Tests: MCP Tools over Mock Store', () => {
  it('success: list_orders', async () => {
    currentScenario = 'success';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    expect(res.isError).toBeUndefined();
    const data = JSON.parse(res.content[0].text);
    expect(data.data[0].id).toBe(101);
  });

  it('success: get_product', async () => {
    currentScenario = 'success';
    const res = await callTool('get_product', { id: 50 });
    expect(res.isError).toBeUndefined();
    const data = JSON.parse(res.content[0].text);
    expect(data.id).toBe(50);
    expect(data.sku).toBe('SKU-1');
  });

  it('401: Authentication failure', async () => {
    currentScenario = '401';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Authentication failed');
  });

  it('404: Resource not found', async () => {
    currentScenario = '404';
    const res = await callTool('get_order', { id: 999 });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('Resource not found');
  });

  it('429: Rate limited with Retry-After', async () => {
    currentScenario = '429';
    const start = Date.now();
    const promise = callTool('list_orders', { page: 1, per_page: 10 });
    
    // Clear 429 after 500ms so the retry succeeds
    setTimeout(() => { currentScenario = 'success'; }, 500);
    
    const res = await promise;
    const duration = Date.now() - start;
    
    expect(res.isError).toBeUndefined();
    expect(duration).toBeGreaterThanOrEqual(1000); // Wait honored
    expect(requestCount).toBeGreaterThanOrEqual(2); // Initial + Retry
  });

  it('503 then recovery', async () => {
    currentScenario = '503-recovery';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    expect(res.isError).toBeUndefined();
    expect(requestCount).toBe(2);
    const data = JSON.parse(res.content[0].text);
    expect(data.data[0].id).toBe(102);
  });

  it('timeout (ECONNRESET)', async () => {
    currentScenario = 'timeout';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    expect(res.isError).toBe(true);
    // Since we destroy the socket, fetch throws a generic TypeError or fetch failed
    expect(res.content[0].text).toMatch(/fetch failed|Upstream error/i);
  });

  it('malformed JSON', async () => {
    currentScenario = 'malformed';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    expect(res.isError).toBe(true);
    // Undici / fetch throws a syntax error on bad JSON
    expect(res.content[0].text).toMatch(/Unexpected token|JSON/i);
  });

  it('pagination headers', async () => {
    currentScenario = 'pagination';
    const res = await callTool('list_orders', { page: 1, per_page: 10 });
    const data = JSON.parse(res.content[0].text);
    expect(data.meta.total).toBe(15);
    expect(data.meta.total_pages).toBe(2);
    expect(data.meta.has_more).toBe(true);
  });

  it('PII masking off (default)', async () => {
    currentScenario = 'pii-off';
    const res = await callTool('get_order', { id: 101 });
    const data = JSON.parse(res.content[0].text);
    expect(data.customer.email).toBe('[MASKED]');
    expect(data.customer.phone).toBe('[MASKED]');
  });

  it('PII masking on', async () => {
    currentScenario = 'pii-on';
    process.env.ENABLE_PII = 'true';
    const res = await callTool('get_order', { id: 101 });
    const data = JSON.parse(res.content[0].text);
    expect(data.customer.email).toBe('test@example.com');
    expect(data.customer.phone).toBe('555-1234');
  });
});
