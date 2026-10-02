import { BaseService } from './base-service.js';
import type { WooOrder } from '../types/woo.js';

export class OrderService extends BaseService {
  async listOrders(args: { page?: number; per_page?: number; status?: string; customer?: number; after?: string; before?: string; search?: string; }) {
    const page = args.page || 1;
    const perPage = args.per_page || 10;
    
    const qs = new URLSearchParams();
    if (args.status) qs.append('status', args.status);
    if (args.customer) qs.append('customer', String(args.customer));
    if (args.after) qs.append('after', args.after);
    if (args.before) qs.append('before', args.before);
    if (args.search) qs.append('search', args.search);
    qs.append('page', String(page));
    qs.append('per_page', String(perPage));

    const response = await this.client.fetch<WooOrder[]>({ path: `/orders?${qs.toString()}` });
    
    const mapped = response.data.map(o => this.mapOrder(o));
    const meta = this.extractPagination(response.headers, page, perPage);

    return { meta, data: mapped };
  }

  async getOrder(id: number) {
    const response = await this.client.fetch<WooOrder>({ path: `/orders/${id}` });
    return this.mapOrder(response.data);
  }

  private mapOrder(order: WooOrder) {
    return {
      id: order.id,
      status: order.status,
      total: order.total,
      currency: order.currency,
      date_created: order.date_created,
      customer: {
        customer_id: order.customer_id,
        email: order.billing?.email ? this.maskString(order.billing.email) : undefined,
        phone: order.billing?.phone ? this.maskString(order.billing.phone) : undefined,
      },
      line_items: (order.line_items || []).map(item => ({
        id: item.id,
        name: item.name,
        product_id: item.product_id,
        quantity: item.quantity,
        total: item.total
      }))
    };
  }
}
