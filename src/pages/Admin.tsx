
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Panel de Administración" />
      
      <main className="flex-1 bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="menu">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="menu">Menú</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
              <TabsTrigger value="staff">Personal</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Productos</CardTitle>
                    <CardDescription>
                      Crear, editar y eliminar productos del menú
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Función en desarrollo...</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Categorías</CardTitle>
                    <CardDescription>
                      Crear y editar categorías del menú
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Función en desarrollo...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tables">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Mesas</CardTitle>
                  <CardDescription>
                    Crear, editar y eliminar mesas del local
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center">
                    <p className="text-gray-500">Función en desarrollo...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Personal</CardTitle>
                  <CardDescription>
                    Crear usuarios con nombre, código PIN, y rol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center">
                    <p className="text-gray-500">Función en desarrollo...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pedidos</CardTitle>
                  <CardDescription>
                    Ver pedidos filtrados por fecha, camarero o mesa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 text-center">
                    <p className="text-gray-500">Función en desarrollo...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
