import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '../observability/logger.js';
import { WooClient } from '../client/woo-client.js';
import { OrderService } from '../services/order-service.js';
import { ProductService } from '../services/product-service.js';
import * as schemas from '../tools/schemas.js';

export const server = new McpServer({
  name: 'woo-connector',
  version: '1.0.0',
});

export const client = new WooClient();
const orders = new OrderService(client);
const products = new ProductService(client);

server.tool('list_orders', 'List orders', schemas.listOrdersSchema, async (args) => {
  try {
    const data = await orders.listOrders(args);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('get_order', 'Get order by id', schemas.getOrderSchema, async (args) => {
  try {
    const data = await orders.getOrder(args.id);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('search_orders', 'Search orders', schemas.searchOrdersSchema, async (args) => {
  try {
    const data = await orders.listOrders(args);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('list_products', 'List products', schemas.listProductsSchema, async (args) => {
  try {
    const data = await products.listProducts(args);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('get_product', 'Get product by id', schemas.getProductSchema, async (args) => {
  try {
    const data = await products.getProduct(args.id);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('search_products', 'Search products', schemas.searchProductsSchema, async (args) => {
  try {
    const data = await products.listProducts(args);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

server.tool('check_stock', 'Check product stock', schemas.checkStockSchema, async (args) => {
  try {
    const data = await products.checkStock(args.id);
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (e: unknown) { return { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }; }
});

export async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('MCP Server running on stdio');
}
