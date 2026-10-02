import { BaseService } from './base-service.js';
import type { WooProduct } from '../types/woo.js';

export class ProductService extends BaseService {
  async listProducts(args: { page?: number; per_page?: number; category?: string; status?: string; stock_status?: string; search?: string; }) {
    const page = args.page || 1;
    const perPage = args.per_page || 10;
    
    const qs = new URLSearchParams();
    if (args.category) qs.append('category', args.category);
    if (args.status) qs.append('status', args.status);
    if (args.stock_status) qs.append('stock_status', args.stock_status);
    if (args.search) qs.append('search', args.search);
    qs.append('page', String(page));
    qs.append('per_page', String(perPage));

    const response = await this.client.fetch<WooProduct[]>({ path: `/products?${qs.toString()}` });
    
    const mapped = response.data.map(p => this.mapProduct(p));
    const meta = this.extractPagination(response.headers, page, perPage);

    return { meta, data: mapped };
  }

  async getProduct(id: number) {
    const response = await this.client.fetch<WooProduct>({ path: `/products/${id}` });
    return this.mapProduct(response.data);
  }

  async checkStock(id: number) {
    const response = await this.client.fetch<WooProduct>({ path: `/products/${id}` });
    return {
      id: response.data.id,
      stock_status: response.data.stock_status,
      stock_quantity: response.data.stock_quantity
    };
  }

  private mapProduct(product: WooProduct) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock_status: product.stock_status,
      stock_quantity: product.stock_quantity,
      categories: (product.categories || []).map(c => ({ id: c.id, name: c.name }))
    };
  }
}
