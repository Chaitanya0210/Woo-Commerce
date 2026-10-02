import fs from 'fs';
import path from 'path';

const orders = Array.from({ length: 30 }, (_, i) => ({
  id: 1000 + i,
  status: i % 5 === 0 ? 'processing' : 'completed',
  total: (Math.random() * 200 + 20).toFixed(2),
  currency: 'USD',
  date_created: new Date(Date.now() - i * 86400000).toISOString(),
  billing: {
    first_name: `Customer${i}`,
    last_name: 'Doe',
    email: `customer${i}@example.com`,
    phone: `555-010${i}`
  },
  line_items: [
    { id: 2000 + i, name: `Widget ${i % 10}`, product_id: 50 + (i % 10), quantity: 1, total: '20.00' }
  ]
}));

const products = Array.from({ length: 20 }, (_, i) => ({
  id: 50 + i,
  name: `Widget ${i}`,
  sku: `WIDGET-${i}`,
  price: '20.00',
  stock_status: i % 4 === 0 ? 'outofstock' : 'instock',
  stock_quantity: i % 4 === 0 ? 0 : 50,
  categories: [{ id: 1, name: 'Widgets' }]
}));

fs.writeFileSync(path.join(process.cwd(), 'fixtures', 'orders.json'), JSON.stringify(orders, null, 2));
fs.writeFileSync(path.join(process.cwd(), 'fixtures', 'products.json'), JSON.stringify(products, null, 2));

console.log('Generated 30 synthetic orders and 20 products in fixtures/');
