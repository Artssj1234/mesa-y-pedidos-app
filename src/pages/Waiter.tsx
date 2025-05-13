
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Product, OrderItem, Category } from "@/types";
import { mockCategories } from "@/services/mockData";

const Waiter = () => {
  const { user } = useAuth();
  const { tables, products, createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [observations, setObservations] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(mockCategories[0]?.id || "");
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  
  // Redirect if not waiter
  useEffect(() => {
    if (user && user.role !== 'waiter') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Filter active tables
  const activeTables = tables.filter(table => table.active);
  
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category_id]) {
      acc[product.category_id] = [];
    }
    acc[product.category_id].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
  
  // Add item to order
  const addItem = (product: Product) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, {
          product_id: product.id,
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
                          <Button
                            key={category.id}
                            variant={activeCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(category.id)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {productsByCategory[activeCategory]?.map(product => (
                        <Button
                          key={product.id}
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => addItem(product)}
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
              <div className="p-6 text-center">
                <p className="text-gray-500">Función en desarrollo...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Waiter;
