import { describe, it, expect } from 'vitest';
import { WooClient } from '../../src/client/woo-client.js';

describe('Retry Exhaustion', () => {
  it('exhausts retries and throws the final error', async () => {
    const client = new WooClient();
    
    // Force a fetch to 502 repeatedly and see it fail after 3 retries. 
    // We already do a 502 test, but let's test specifically the error bubble up.
    // wait, we mock fetch via global or intercept it. Since we do a real server in tests:
    // This is tested in client.test.ts, but let's just make a simple test here if we mock the fetch.
    const originalFetch = global.fetch;
    let callCount = 0;
    global.fetch = async () => {
      callCount++;
      return { 
        status: 502, 
        text: async () => 'Bad Gateway',
        headers: { get: () => null }
      } as any;
    };
    
    try {
      // By default retries 3 times. So 1 initial + 3 retries = 4 calls.
      await expect(client.fetch({ path: '/orders' })).rejects.toThrow('Upstream error 502: Bad Gateway');
      expect(callCount).toBe(4);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
