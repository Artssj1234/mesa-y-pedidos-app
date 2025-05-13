
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, OrderItem, Product, Table } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { mockOrders, mockProducts, mockTables } from '@/services/mockData';

interface OrderContextType {
  orders: Order[];
  tables: Table[];
  products: Product[];
  createOrder: (tableId: string, items: OrderItem[], observations: string, userId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with mock data
    setOrders(mockOrders);

    // This would be replaced with Supabase real-time subscription
    const interval = setInterval(() => {
      // Simulate receiving new orders or updates
      console.log("Checking for updates...");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const createOrder = async (tableId: string, items: OrderItem[], observations: string, userId: string) => {
    try {
      // This would be replaced with a Supabase insert
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        table_id: tableId,
        table_number: tables.find(t => t.id === tableId)?.number,
        observations,
        status: 'pending',
        user_id: userId,
        waiter_name: 'Juan Camarero', // This would come from the actual user data
        created_at: new Date().toISOString(),
        items: items.map(item => {
          const product = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: product?.name,
            product_price: product?.price
          };
        }),
      };

      // Add to local state
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast({
        title: "Pedido creado",
        description: `Pedido enviado a cocina para mesa ${newOrder.table_number}`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el pedido",
      });
      return Promise.reject(error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // This would be replaced with a Supabase update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      const statusMessages = {
        pending: "pendiente",
        preparing: "preparando",
        ready: "listo"
      };
      
      toast({
        title: "Estado actualizado",
        description: `Pedido ahora ${statusMessages[status]}`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
      });
      return Promise.reject(error);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        tables,
        products,
        createOrder,
        updateOrderStatus
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
