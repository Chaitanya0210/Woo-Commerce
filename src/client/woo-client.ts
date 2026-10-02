import { logger } from '../observability/logger.js';
import { addOutgoingLog } from '../observability/memory-log.js';
import { config } from '../config/index.js';
import { TokenBucket } from './rate-limiter.js';
import { CircuitBreaker } from './circuit-breaker.js';
import { Cache } from './cache.js';
import { calculateJitter } from './retry.js';
import { AuthError, NotFoundError, RateLimitedError, UpstreamError, ValidationError, WooClientError } from './errors.js';

interface WooRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
}

export class WooClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  public readonly bucket: TokenBucket;
  public readonly breaker: CircuitBreaker;
  private readonly cache: Cache<unknown>;

  constructor() {
    this.baseUrl = config.WOO_URL.replace(/\/$/, '') + '/wp-json/wc/v3';
    this.authHeader = `Basic ${Buffer.from(`${config.WOO_KEY}:${config.WOO_SECRET}`).toString('base64')}`;
    this.bucket = new TokenBucket(10, 5);
    this.breaker = new CircuitBreaker(5, 30000);
    this.cache = new Cache(30000); // 30s TTL
  }

  async fetch<T>(options: WooRequestOptions, retryCount = 0): Promise<{ data: T; headers: Record<string, string> }> {
    const method = options.method || 'GET';
    const cacheKey = `${method}:${options.path}:${JSON.stringify(options.query || {})}`;
    
    if (method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached as { data: T; headers: Record<string, string> };
    }

    return this.breaker.execute(async () => {
      await this.bucket.acquire(1);

      const url = new URL(this.baseUrl + options.path);
      if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        }
      }

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 10000);
      const start = Date.now();

      try {
        const response = await fetch(url.toString(), {
          method,
          headers: {
            Authorization: this.authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: abortController.signal,
        });

        const duration = Date.now() - start;
        const status = response.status;

        logger.debug({ method, path: options.path, status, duration }, 'WooCommerce request');
        addOutgoingLog({ method, path: options.path, status, duration, retryCount });

        if (status >= 200 && status < 300) {
          const data = (await response.json()) as T;
          const result = { data, headers: Object.fromEntries(response.headers.entries()) };
          if (method === 'GET') this.cache.set(cacheKey, result);
          return result;
        }

        const errorText = await response.text().catch(() => '');

        if (status === 401 || status === 403) throw new AuthError(`Authentication failed: ${errorText}`);
        if (status === 404) throw new NotFoundError(`Resource not found: ${options.path}`);
        if (status === 400) throw new ValidationError(`Bad request: ${errorText}`);

        if (status === 429 || status >= 500) {
          const isRetryableMethod = method === 'GET';
          if (retryCount < 3 && (isRetryableMethod || status === 429)) {
            const retryAfter = response.headers.get('retry-after');
            const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : calculateJitter(500, retryCount);
            logger.warn({ delayMs, path: options.path, status }, 'Retrying request');
            await new Promise(res => setTimeout(res, delayMs));
            return this.fetch<T>(options, retryCount + 1);
          }
          if (status === 429) throw new RateLimitedError('Too many requests', retryCount);
          throw new UpstreamError(`Upstream error ${status}: ${errorText}`, status);
        }

        throw new WooClientError(`Unexpected status ${status}: ${errorText}`, status);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          if (retryCount < 3 && method === 'GET') {
             const delayMs = calculateJitter(500, retryCount);
             await new Promise(res => setTimeout(res, delayMs));
             return this.fetch<T>(options, retryCount + 1);
          }
          throw new UpstreamError('Request timed out', 504);
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    });
  }
}
