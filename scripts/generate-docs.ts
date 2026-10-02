import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as schemas from '../src/tools/schemas.js';

const tools = [
  { name: 'list_orders', description: 'List orders', schema: schemas.listOrdersSchema },
  { name: 'search_orders', description: 'Search orders', schema: schemas.searchOrdersSchema },
  { name: 'get_order', description: 'Get order by id', schema: schemas.getOrderSchema },
  { name: 'list_products', description: 'List products', schema: schemas.listProductsSchema },
  { name: 'search_products', description: 'Search products', schema: schemas.searchProductsSchema },
  { name: 'get_product', description: 'Get product by id', schema: schemas.getProductSchema },
  { name: 'check_stock', description: 'Check product stock', schema: schemas.checkStockSchema },
];

import { z } from 'zod';

const out = tools.map(t => ({
  name: t.name,
  description: t.description,
  inputSchema: zodToJsonSchema(z.object(t.schema))
}));

fs.writeFileSync(path.join(process.cwd(), 'docs', 'mcp-tools.json'), JSON.stringify(out, null, 2));
console.log('docs/mcp-tools.json generated.');
