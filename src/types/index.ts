
export type UserRole = 'admin' | 'waiter' | 'kitchen';

export interface User {
  id: string;
  name: string;
  code?: string; // PIN code for waiters
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category?: Category;
}

export interface Table {
  id: string;
  number: number;
  active: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready';

export interface Order {
  id: string;
  table_id: string;
  table_number?: number;
  observations: string;
  status: OrderStatus;
  user_id: string;
  waiter_name?: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name?: string;
  product_price?: number;
  quantity: number;
}
