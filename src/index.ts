import { runStdio } from './mcp/server.js';
import { runHttp } from './http/index.js';

const mode = process.argv[2];

if (mode === 'http') {
  runHttp();
} else {
  runStdio().catch(console.error);
}
