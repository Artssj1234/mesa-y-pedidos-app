
import { Category, Product, Table, Order, OrderStatus } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Bebidas' },
  { id: '2', name: 'Entrantes' },
  { id: '3', name: 'Principales' },
  { id: '4', name: 'Postres' },
];

export const mockProducts: Product[] = [
  // Bebidas
  { id: '1', name: 'Agua', price: 1.50, category_id: '1' },
  { id: '2', name: 'Refresco', price: 2.50, category_id: '1' },
  { id: '3', name: 'Cerveza', price: 3.00, category_id: '1' },
  { id: '4', name: 'Vino copa', price: 3.50, category_id: '1' },
  
  // Entrantes
  { id: '5', name: 'Patatas bravas', price: 5.00, category_id: '2' },
  { id: '6', name: 'Croquetas', price: 6.00, category_id: '2' },
  { id: '7', name: 'Ensalada', price: 7.50, category_id: '2' },
  { id: '8', name: 'Tortilla', price: 5.50, category_id: '2' },
  
  // Principales
  { id: '9', name: 'Burger', price: 12.00, category_id: '3' },
  { id: '10', name: 'Pasta', price: 10.00, category_id: '3' },
  { id: '11', name: 'Paella', price: 15.00, category_id: '3' },
  { id: '12', name: 'Pescado', price: 16.50, category_id: '3' },
  
  // Postres
  { id: '13', name: 'Tarta', price: 5.00, category_id: '4' },
  { id: '14', name: 'Helado', price: 4.00, category_id: '4' },
  { id: '15', name: 'Fruta', price: 3.50, category_id: '4' },
  { id: '16', name: 'Café', price: 1.80, category_id: '4' },
];

export const mockTables: Table[] = [
  { id: '1', number: 1, active: true },
  { id: '2', number: 2, active: true },
  { id: '3', number: 3, active: true },
  { id: '4', number: 4, active: true },
  { id: '5', number: 5, active: false },
  { id: '6', number: 6, active: true },
];

// Helper function to generate a mock order
export const generateMockOrder = (id: string, tableId: string, userId: string, status: OrderStatus): Order => {
  const randomProducts = mockProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 4) + 1);
  
  return {
    id,
    table_id: tableId,
    table_number: mockTables.find(t => t.id === tableId)?.number,
    observations: ['Sin sal', 'Extra picante', 'Alergias: lactosa', ''][Math.floor(Math.random() * 4)],
    status,
    user_id: userId,
    waiter_name: ['Juan Camarero', 'María Camarera'][Math.floor(Math.random() * 2)],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    items: randomProducts.map(product => ({
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
  };
};

// Generate some mock orders
export const mockOrders: Order[] = [
  generateMockOrder('1', '1', '2', 'pending'),
  generateMockOrder('2', '2', '3', 'preparing'),
  generateMockOrder('3', '3', '2', 'pending'),
  generateMockOrder('4', '4', '3', 'ready'),
  generateMockOrder('5', '6', '2', 'ready'),
];
