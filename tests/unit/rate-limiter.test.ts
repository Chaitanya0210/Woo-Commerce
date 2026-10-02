import { describe, it, expect } from 'vitest';
import { TokenBucket } from '../../src/client/rate-limiter.js';

describe('TokenBucket', () => {
  it('should allow requests within capacity', async () => {
    const bucket = new TokenBucket(5, 5);
    const start = Date.now();
    await bucket.acquire(1);
    await bucket.acquire(1);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('should delay requests when empty', async () => {
    const bucket = new TokenBucket(1, 10); // 1 token, 10 per sec (100ms per token)
    await bucket.acquire(1); // empty the bucket
    const start = Date.now();
    await bucket.acquire(1); // wait for 1 token
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(50);
  });
});
