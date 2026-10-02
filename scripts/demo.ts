import { execSync } from 'child_process';
import http from 'http';
import { runHttp } from '../src/http/index.js';

console.log('--- WOO-CONNECTOR DEMO ---');

// 1. Start mock server
const port = 3999;
process.env.WOO_URL = `http://localhost:${port}`;
process.env.WOO_KEY = 'test';
process.env.WOO_SECRET = 'test';
process.env.ADMIN_PORT = '3000';

const server = http.createServer((req, res) => {
  if (req.url?.includes('orders')) {
    if (req.headers['x-force-429']) {
      res.writeHead(429, { 'Retry-After': '1', 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Rate limited' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 101, status: 'completed', total: '150.00 USD' }]));
    return;
  }
  res.writeHead(404);
  res.end();
});
server.listen(port, () => console.log('Mock WooCommerce started on port', port));

// Start HTTP admin
runHttp();

setTimeout(async () => {
  console.log('\n2. Testing force 429 backoff...');
  
  const start = Date.now();
  // We trigger a real client fetch
  const { WooClient } = await import('../src/client/woo-client.js');
  const client = new WooClient();
  
  // We mock the first call to return 429
  const realFetch = global.fetch;
  let callCount = 0;
  global.fetch = async (url, opts) => {
    callCount++;
    if (callCount === 1) {
      return new Response(JSON.stringify({}), { status: 429, headers: new Headers({'retry-after': '1'}) });
    }
    return new Response(JSON.stringify([{ id: 101, status: 'completed' }]), { status: 200, headers: new Headers() });
  };
  
  await client.fetch({ path: '/orders' });
  const duration = Date.now() - start;
  
  console.log(`Call succeeded after ${duration}ms (Expected >= 1000ms due to Retry-After). Call count: ${callCount}`);
  
  console.log('\n3. Request Logs in Admin API:');
  const logs = await (await realFetch('http://localhost:3000/api/admin/logs')).json();
  console.log(logs);

  console.log('\nDemo completed.');
  process.exit(0);
}, 1000);
