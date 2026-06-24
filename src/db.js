import Dexie from 'dexie';

export const db = new Dexie('CafeManagerProDB');

db.version(1).stores({
  products: 'id, name, category_id',
  inventory: 'id, name',
  orders: 'id, order_number, created_at, sync_status',
  customers: 'id, full_name',
  sync_queue: '++id, action, payload, created_at'
});
