
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { OrderItem, OrderStatus } from "@/types";
import OrderCard from "@/components/OrderCard";

const Waiter = () => {
  const { user } = useAuth();
  const { tables, products, orders, createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [observations, setObservations] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  // Redirect if not waiter
  useEffect(() => {
    if (user && user.role !== 'waiter') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Set first category as active when products load
  useEffect(() => {
    if (products.length > 0) {
      const categories = [...new Set(products.map(p => p.category_id))];
      if (categories.length > 0 && !activeCategory) {
        setActiveCategory(categories[0] || "");
      }
    }
  }, [products, activeCategory]);
  
  // Filter active tables
  const activeTables = tables.filter(table => table.active);
  
  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  
  // Filter products by active category
  const filteredProducts = products.filter(p => p.category_id === activeCategory);
  
  // Filter active orders for this waiter
  const activeOrders = orders.filter(order => 
    order.user_id === user?.id && 
    (order.status === 'pending' || order.status === 'preparing')
  );
  
  // Filter ready orders for this waiter
  const readyOrders = orders.filter(order => 
    order.user_id === user?.id && 
    order.status === 'ready'
  );
  
  // Add item to order
  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.product_id === productId);
      if (existingItem) {
        return prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          product_id: productId,
          product_name: product.name,
          product_price: product.price,
          quantity: 1
        }];
      }
    });
  };
  
  // Remove item from order
  const removeItem = (productId: string) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.product_id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prev.filter(item => item.product_id !== productId);
      }
    });
  };
  
  // Calculate order total
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + ((item.product_price || 0) * item.quantity);
    }, 0);
  };
  
  // Submit order
  const handleSubmitOrder = async () => {
    if (!selectedTable || selectedItems.length === 0 || !user) return;
    
    await createOrder(selectedTable, selectedItems, observations, user.id);
    
    // Reset form
    setSelectedTable(null);
    setSelectedItems([]);
    setObservations("");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Vista Camarero" />
      
      <main className="flex-1 bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="newOrder">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="newOrder">Nuevo Pedido</TabsTrigger>
              <TabsTrigger value="activeOrders">Pedidos Activos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="newOrder">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Table Selection */}
                <div>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Seleccionar Mesa</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {activeTables.map(table => (
                        <Button
                          key={table.id}
                          variant={selectedTable === table.id ? "default" : "outline"}
                          className="h-16"
                          onClick={() => setSelectedTable(table.id)}
                        >
                          {table.number}
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
                
                {/* Middle Column - Products */}
                <div>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Productos</h3>
                    
                    <div className="mb-4 overflow-x-auto">
                      <div className="flex space-x-2">
                        {categories.map(category => (
                          category && (
                            <Button
                              key={category.id}
                              variant={activeCategory === category.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setActiveCategory(category.id)}
                            >
                              {category.name}
                            </Button>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredProducts.map(product => (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => addItem(product.id)}
                        >
                          <span>{product.name}</span>
                          <span>{product.price.toFixed(2)}€</span>
                        </Button>
                      ))}
                    </div>
                  </Card>
                </div>
                
                {/* Right Column - Order Summary */}
                <div>
                  <Card className="p-4">
                    <h3 className="font-medium mb-4">Resumen del Pedido</h3>
                    
                    {selectedTable ? (
                      <div className="mb-4">
                        <div className="font-medium">Mesa {tables.find(t => t.id === selectedTable)?.number}</div>
                      </div>
                    ) : (
                      <div className="text-amber-600 mb-4">Seleccione una mesa</div>
                    )}
                    
                    {selectedItems.length > 0 ? (
                      <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                        {selectedItems.map(item => (
                          <div key={item.product_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{item.quantity}x</span> {item.product_name}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>{((item.product_price || 0) * item.quantity).toFixed(2)}€</span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => removeItem(item.product_id)}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-4">No hay productos seleccionados</div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="observations" className="block text-sm font-medium mb-2">
                        Observaciones
                      </label>
                      <Textarea
                        id="observations"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Sin sal, alergias, etc."
                        className="h-20"
                      />
                    </div>
                    
                    <div className="flex justify-between mb-4">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{calculateTotal().toFixed(2)}€</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      disabled={!selectedTable || selectedItems.length === 0}
                      onClick={handleSubmitOrder}
                    >
                      Enviar Pedido a Cocina
                    </Button>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activeOrders">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Pedidos en preparación</h3>
                  {activeOrders.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-lg shadow-sm border">
                      <p className="text-gray-500">No hay pedidos en preparación</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeOrders.map(order => (
                        <OrderCard key={order.id} order={order} showControls={false} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Pedidos listos para servir</h3>
                  {readyOrders.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-lg shadow-sm border">
                      <p className="text-gray-500">No hay pedidos listos</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {readyOrders.map(order => (
                        <OrderCard key={order.id} order={order} showControls={false} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Waiter;
