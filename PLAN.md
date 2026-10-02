# Implementation Plan

## Architecture & Data Flow
- **Transport**: Express HTTP server for Admin API & MCP HTTP transport. stdio for local Agent Studio testing.
- **Tools**: MCP tool definitions powered by Zod schemas. Thin wrappers over Services.
- **Service**: Domain logic for Orders and Products. Data shaping, filtering normalization.
- **Client**: `WooClient` containing the HTTP logic, Rate Limiting (Token Bucket), Circuit Breaker, Retries, and Error mapping. 
- **Security**: Strict credential redaction in logs, hashed tokens for Agent Studio MCP access.

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

## Build Order
- **Phase 1**: Scaffolding, config parsing, logger setup, ESLint/Prettier, CI check script.
- **Phase 2**: `WooClient` implementation with auth, retries, token bucket rate limiter, circuit breaker, plus comprehensive unit tests.
- **Phase 3**: Services layer and MCP tools mapping, along with local integration tests using a mocked Express store with fixtures.
- **Phase 4**: HTTP transport, token-based bearer auth for MCP, Admin API endpoints.
- **Phase 5**: Admin Console (React, Vite, custom dark theme).
- **Phase 6**: Docs generation, Demo script, Dockerization, final polish.
