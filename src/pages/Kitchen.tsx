
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import Header from "@/components/Header";
import OrderCard from "@/components/OrderCard";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Kitchen = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  
  // Redirect if not kitchen staff
  useEffect(() => {
    if (user && user.role !== 'kitchen') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Filter active orders (pending or preparing)
  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'preparing'
  );
  
  // Filter completed orders (ready)
  const completedOrders = orders.filter(order => order.status === 'ready');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Vista Cocina" />
      
      <main className="flex-1 bg-gray-50 p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Pedidos activos</h2>
            
            {activeOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg shadow-sm border">
                <p className="text-gray-500">No hay pedidos activos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showControls={true} />
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Pedidos listos</h2>
            
            {completedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg shadow-sm border">
                <p className="text-gray-500">No hay pedidos completados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showControls={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Kitchen;
