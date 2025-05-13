
import { Order, OrderStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';

interface OrderCardProps {
  order: Order;
  showControls?: boolean;
}

const OrderCard = ({ order, showControls = true }: OrderCardProps) => {
  const { updateOrderStatus } = useOrders();
  
  const statusColors = {
    pending: 'bg-order-pending',
    preparing: 'bg-order-preparing',
    ready: 'bg-order-ready'
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
  
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <div className="text-lg font-bold">Mesa {order.table_number}</div>
          <div className="text-xs text-gray-500">
            {formatTime(order.created_at)} • {order.waiter_name}
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
                {(item.product_price || 0) * item.quantity}€
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
                className="border-order-preparing text-order-preparing"
                onClick={() => updateOrderStatus(order.id, 'preparing')}
              >
                Preparando
              </Button>
            )}
            
            {order.status === 'preparing' && (
              <Button 
                variant="outline"
                className="border-order-ready text-order-ready"
                onClick={() => updateOrderStatus(order.id, 'ready')}
              >
                Listo
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderCard;
