import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import http from 'http';

process.env.WOO_URL = `http://localhost:3999`;
process.env.WOO_KEY = 'test_key';
process.env.WOO_SECRET = 'test_secret';

import { WooClient } from '../../src/client/woo-client.js';

let server: http.Server;
const port = 3999;
let requestCount = 0;
let overrideStatus: number | null = null;
let retryAfter: string | null = null;

beforeAll(() => {
  process.env.WOO_URL = `http://localhost:${port}`;
  process.env.WOO_KEY = 'test_key';
  process.env.WOO_SECRET = 'test_secret';
  
  server = http.createServer((req, res) => {
    requestCount++;
    if (overrideStatus) {
      if (retryAfter) res.setHeader('Retry-After', retryAfter);
      res.writeHead(overrideStatus);
      res.end(JSON.stringify({ message: 'Error' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: requestCount }));
  });
  server.listen(port);
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  requestCount = 0;
  overrideStatus = null;
  retryAfter = null;
});

describe('WooClient', () => {
  it('should successfully fetch on 200', async () => {
    const client = new WooClient();
    const res = await client.fetch<any>({ path: '/orders' });
    expect(res.data.success).toBe(true);
    expect(requestCount).toBe(1);
  });

  it('should retry on 429 with Retry-After', async () => {
    const client = new WooClient();
    overrideStatus = 429;
    retryAfter = '1';
    
    setTimeout(() => {
      overrideStatus = null;
      retryAfter = null;
    }, 500); // the mock retry-after is 1s, so this will clear it before the next fetch

    const start = Date.now();
    const res = await client.fetch<any>({ path: '/orders' });
    const duration = Date.now() - start;
    
    expect(res.data.success).toBe(true);
    expect(requestCount).toBeGreaterThanOrEqual(2);
    expect(duration).toBeGreaterThanOrEqual(1000);
  });

  it('should open circuit breaker after threshold failures', async () => {
    const client = new WooClient();
    overrideStatus = 502;
    
    for(let i=0; i<6; i++) {
      try {
        await client.fetch({ path: '/orders' });
      } catch (e) {
        // ignore
      }
    }
    
    expect(client.breaker.getState()).toBe('OPEN');
    await expect(client.fetch({ path: '/orders' })).rejects.toThrow('Circuit breaker is OPEN');
  }, 15000);

  it('should use cache for identical GET requests', async () => {
    const client = new WooClient();
    await client.fetch({ path: '/products' });
    const c1 = requestCount;
    await client.fetch({ path: '/products' });
    expect(requestCount).toBe(c1); // shouldn't increment
  });
});
