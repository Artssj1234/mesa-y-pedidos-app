
import { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  showControls?: boolean;
}

const OrderCard = ({ order, showControls = true }: OrderCardProps) => {
  const { updateOrderStatus } = useOrders();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const statusColors = {
    pending: 'bg-amber-500',
    preparing: 'bg-blue-500',
    ready: 'bg-green-500'
  };
  
  const statusLabels = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo'
  };
  
  // Format the timestamp to a readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Calculate the total of the order
  const calculateTotal = () => {
    return order.items.reduce((total, item) => {
      return total + ((item.product_price || 0) * item.quantity);
    }, 0);
  };
  
  const handleStatusUpdate = async (status: OrderStatus) => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(order.id, status);
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <div className="text-lg font-bold">Mesa {order.table_number}</div>
          <div className="text-xs text-gray-500">
            {order.created_at && formatTime(order.created_at)} • {order.waiter_name}
          </div>
        </div>
        <Badge className={`${statusColors[order.status]} text-white`}>
          {statusLabels[order.status]}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item, index) => (
            <li key={index} className="py-2 flex justify-between">
              <div>
                <span className="font-medium">{item.quantity}x</span> {item.product_name}
              </div>
              <div className="text-gray-600">
                {((item.product_price || 0) * item.quantity).toFixed(2)}€
              </div>
            </li>
          ))}
        </ul>
        
        {order.observations && (
          <div className="mt-3 p-2 bg-gray-50 rounded-md text-sm">
            <span className="font-medium">Observaciones:</span> {order.observations}
          </div>
        )}
      </CardContent>
      
      {showControls && (
        <CardFooter className="pt-2 flex justify-between border-t">
          <div className="font-semibold">
            Total: {calculateTotal().toFixed(2)}€
          </div>
          
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Button 
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                onClick={() => handleStatusUpdate('preparing')}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Preparando'
                )}
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button 
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50"
                onClick={() => handleStatusUpdate('ready')}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Listo'
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderCard;
