import type { WooClient } from '../client/woo-client.js';

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_more: boolean;
}

export class BaseService {
  constructor(protected readonly client: WooClient) {}

  protected extractPagination(headers: Record<string, string>, queryPage: number, queryPerPage: number): PaginationMeta {
    const total = parseInt(headers['x-wp-total'] || '0', 10);
    const totalPages = parseInt(headers['x-wp-totalpages'] || '1', 10);
    return {
      page: queryPage,
      per_page: queryPerPage,
      total,
      total_pages: totalPages,
      has_more: queryPage < totalPages,
    };
  }

  protected maskString(str: string): string {
    return process.env.ENABLE_PII === 'true' ? str : '[MASKED]';
  }
}
