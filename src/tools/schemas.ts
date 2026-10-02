import { z } from 'zod';

export const listOrdersSchema = {
  status: z.string().optional().describe('Order status (e.g. processing, completed)'),
  customer: z.number().optional().describe('Customer ID'),
  after: z.string().optional().describe('ISO 8601 date'),
  before: z.string().optional().describe('ISO 8601 date'),
  page: z.number().optional().default(1),
  per_page: z.number().max(50).optional().default(10),
} as const satisfies z.ZodRawShape;

export const searchOrdersSchema = {
  search: z.string().describe('Free text search'),
  page: z.number().optional().default(1),
  per_page: z.number().max(50).optional().default(10),
} as const satisfies z.ZodRawShape;

export const getOrderSchema = {
  id: z.number().describe('Order ID'),
} as const satisfies z.ZodRawShape;

export const listProductsSchema = {
  category: z.string().optional().describe('Category ID'),
  status: z.string().optional().describe('Product status (publish, draft)'),
  stock_status: z.string().optional().describe('instock, outofstock, onbackorder'),
  page: z.number().optional().default(1),
  per_page: z.number().max(50).optional().default(10),
} as const satisfies z.ZodRawShape;

export const searchProductsSchema = {
  search: z.string().describe('Free text search for products by name or sku'),
  page: z.number().optional().default(1),
  per_page: z.number().max(50).optional().default(10),
} as const satisfies z.ZodRawShape;

export const getProductSchema = {
  id: z.number().describe('Product ID'),
} as const satisfies z.ZodRawShape;

export const checkStockSchema = {
  id: z.number().describe('Product ID'),
} as const satisfies z.ZodRawShape;

