
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, OrderItem, Product, Table } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  // Fetch tables from Supabase
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*');
        
        if (error) throw error;
        
        const formattedTables = data.map(table => ({
          id: table.id,
          number: table.number,
          active: table.active
        }));
        
        setTables(formattedTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las mesas",
        });
      }
    };

    fetchTables();
  }, [toast]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)');
        
        if (error) throw error;
        
        const formattedProducts = data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          category_id: product.category_id,
          category: product.categories ? { id: product.category_id, name: product.categories.name } : undefined
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos",
        });
      }
    };

    fetchProducts();
  }, [toast]);

  // Fetch orders from Supabase and set up realtime subscription
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching orders...');
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(id, product_id, quantity, products:product_id(name, price)),
            tables:restaurant_tables!orders_table_id_fkey(number),
            users!orders_user_id_fkey(name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }

        console.log('Orders fetched:', data);

        const formattedOrders = data.map(order => {
          const orderItems = order.order_items.map((item: any) => ({
            id: item.id,
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.products?.name,
            product_price: item.products?.price,
            quantity: item.quantity
          }));

          return {
            id: order.id,
            table_id: order.table_id,
            table_number: order.tables?.number,
            observations: order.observations || '',
            status: order.status as OrderStatus,
            user_id: order.user_id,
            waiter_name: order.users?.name,
            created_at: order.created_at,
            items: orderItems
          };
        });
        
        console.log('Formatted orders:', formattedOrders);
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los pedidos",
        });
      }
    };

    fetchOrders();

    // Set up improved realtime subscription
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log('Orders change received:', payload);
          fetchOrders();
        })
      .subscribe();
      
    const orderItemsChannel = supabase
      .channel('order-items-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' }, 
        (payload) => {
          console.log('Order items change received:', payload);
          fetchOrders();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(orderItemsChannel);
    };
  }, [toast]);

  const createOrder = async (tableId: string, items: OrderItem[], observations: string, userId: string) => {
    try {
      console.log("Enviando pedido:", { tableId, items, observations, userId });
      
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          observations,
          status: 'pending',
          user_id: userId
        })
        .select()
        .single();
      
      if (orderError) {
        console.error("Error al crear el pedido:", orderError);
        throw orderError;
      }
      
      console.log("Pedido creado:", orderData);
      
      // Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity
      }));
      
      console.log("Insertando items:", orderItems);
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error("Error al insertar items:", itemsError);
        throw itemsError;
      }
      
      const tableInfo = tables.find(t => t.id === tableId);
      
      toast({
        title: "Pedido creado",
        description: `Pedido enviado a cocina para mesa ${tableInfo?.number}`,
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el pedido. Comprueba la conexión a internet.",
      });
      return Promise.reject(error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      console.log("Actualizando estado del pedido:", { orderId, status });
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) {
        console.error("Error al actualizar estado:", error);
        throw error;
      }
      
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
