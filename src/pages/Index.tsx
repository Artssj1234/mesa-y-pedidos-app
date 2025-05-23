import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import PinInput from "@/components/PinInput";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { validarUsuario } from "@/lib/auth";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya hay un usuario logueado, redirige automáticamente
  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol === "admin") navigate("/admin");
    else if (rol === "camarero") navigate("/camarero");
    else if (rol === "cocina") navigate("/cocina");
  }, []);

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const user = await validarUsuario(username, password);
    setIsLoading(false);

    if (user && user.rol === "admin") {
      localStorage.setItem("usuario", user.usuario);
      localStorage.setItem("rol", user.rol);
      navigate("/admin");
    } else {
      alert("Credenciales incorrectas o rol inválido.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">RestauranteApp</h1>
            <p className="text-gray-500">Sistema de gestión de pedidos</p>
          </div>

          <Tabs defaultValue="pin" className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="pin">Camareros/Cocina</TabsTrigger>
              <TabsTrigger value="admin">Administrador</TabsTrigger>
            </TabsList>

            <TabsContent value="pin">
              <PinInput />
            </TabsContent>

            <TabsContent value="admin">
              <Card>
                <form onSubmit={handleAdminLogin}>
                  <CardHeader>
                    <CardTitle>Acceso Administrador</CardTitle>
                    <CardDescription>
                      Ingrese sus credenciales de administrador (Por defecto: Admin/Admin)
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Usuario
                      </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !username || !password}
                    >
                      {isLoading ? "Cargando..." : "Acceder"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="py-4 text-center text-gray-500 text-sm">
        RestauranteApp © 2025 - Gestión de pedidos para restaurantes
      </footer>
    </div>
  );
};

export default Index;
