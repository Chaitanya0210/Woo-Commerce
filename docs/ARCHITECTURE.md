# Architecture

```mermaid
flowchart TD
    AS[Agent Studio] <-->|stdio / HTTP SSE| MCP[MCP Transport Layer]
    MCP <--> Tools[Tools Layer (Zod validation)]
    Tools <--> Services[Service Layer (Pagination & PII)]
    Services <--> Client[WooClient]
    Client <--> |Retries, Circuit Breaker, Token Bucket| Woo[WooCommerce API]
    
    AdminUI[React Admin Console] <--> AdminAPI[Express Admin API]
    AdminAPI <--> ClientLogs[(Request Logs Memory)]
    AdminAPI <--> TokenMgr[(Token Manager)]
```

## Layers
1. **Transport**: Exposes MCP over stdio or HTTP, plus an Express admin API.
2. **Tools**: Declares MCP tool capabilities, descriptions, and uses `zod` for input validation.
3. **Services**: Domain specific abstractions. Enforces PII masking and shapes raw WooCommerce JSON.
4. **Client**: HTTP interface containing fault tolerance logic (Jittered Retries, Token Bucket rate limiting, Circuit Breaker, GET caching).

## Folder Layout
```
woo-connector/
├── src/
│   ├── config/        # Environment loading and validation
│   ├── client/        # WooClient, rate-limiter, retry, circuit-breaker, errors
│   ├── services/      # OrderService, ProductService
│   ├── tools/         # Tool definitions (list-orders, get-order, etc.)
│   ├── mcp/           # MCP server initialization, registry, stdio/http transports
│   ├── http/          # Express app, admin API routes, bearer auth middleware
│   ├── security/      # Redaction, secrets management, hashing
│   └── observability/ # Logger, metrics
├── web/               # React + Vite admin console
├── tests/
│   ├── unit/          # Unit tests (limiter, retry, breaker, redact, schemas)
│   ├── integration/   # Mock store server, end-to-end MCP HTTP flow
│   └── contract/      # Tool schema validation
├── docs/              # CAPABILITIES, mcp-tools, ARCHITECTURE, LIMITATIONS
├── fixtures/          # Synthetic WooCommerce mock data & generators
└── scripts/           # build, start, demo scripts
```
