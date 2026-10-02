export interface WooOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  customer_id: number;
  billing?: { email?: string; phone?: string; };
  line_items?: { id: number; name: string; product_id: number; quantity: number; total: string; }[];
}

export interface WooProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock_status: string;
  stock_quantity: number;
  categories?: { id: number; name: string; }[];
}
