# woo-connector

A Model Context Protocol (MCP) server that provides read-only access to a WooCommerce store for Agent Studio agents.

## Prerequisites
- Node.js 20+
- WooCommerce store with REST API enabled

## Install
```bash
git clone https://github.com/Chaitanya0210/Woo-Commerce.git Woo-Commerce
cd Woo-Commerce
npm install
```

## Configuration
See `.env.example`. Create a `.env` file with your specific credentials.

| Variable | Description |
| -------- | ----------- |
| `WOO_URL` | Store URL (e.g. `https://example.com`) |
| `WOO_KEY` | WooCommerce Consumer Key |
| `WOO_SECRET` | WooCommerce Consumer Secret |
| `ADMIN_PORT` | Port for the HTTP Admin server (default: 3000) |
| `AGENT_AUTH_TOKEN` | Bearer token for Agent Studio HTTP transport |
| `ENABLE_PII` | Set to `true` to disable PII masking in output |
| `LOG_LEVEL` | Pino log level (default: `info`) |

## Running
**Stdio Mode** (for local Agent Studio):
```bash
npm start
```

**HTTP Mode** (SSE transport + Admin Console):
```bash
npm start http
```

**Docker**:
```bash
docker-compose up -d
```

**Demo**:
```bash
npm run demo
```

**Tests**:
```bash
npm test
```

## Connecting Agent Studio
For HTTP transport, configure Agent Studio with the SSE endpoint `http://localhost:3000/mcp/sse` and use the Bearer token configured in `AGENT_AUTH_TOKEN` or generated via the Admin console.
