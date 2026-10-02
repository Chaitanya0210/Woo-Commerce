# Limitations

- **Read-Only**: No write operations are exposed. The agent cannot issue refunds or update products.
- **Single Store**: The current connector configuration maps to exactly one WooCommerce store.
- **In-Memory State**: Cache, Rate Limiter, Circuit Breaker, and Request Logs are held in memory. They do not persist across restarts and are not shared across distributed instances.
- **Search Capability**: Free-text search relies entirely on WooCommerce's native `search` parameter behavior, which is notoriously basic.
- **Webhooks**: No webhook support for cache invalidation. Data relies entirely on short TTL polling.

## Future Production Considerations
1. Replace `TokenBucket` and `CircuitBreaker` with Redis-backed implementations.
2. Use a robust persistent database (e.g., Postgres) for Token Management.
3. Implement WooCommerce Webhooks to actively invalidate product caches instead of polling.
4. Add OAuth support for multi-tenant Agent Studio integrations.
