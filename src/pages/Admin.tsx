
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Category, Product, Table as TableType, User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [staff, setStaff] = useState<User[]>([]);

  // State for dialogs
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [staffDialog, setStaffDialog] = useState(false);
  
  // State for editing
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tableActive, setTableActive] = useState(true);
  const [staffName, setStaffName] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('waiter');
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data);
    };
    
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        return;
      }
      
      setProducts(data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        category: product.categories ? { id: product.category_id, name: product.categories.name } : undefined
      })));
    };
    
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('number');
      
      if (error) {
        console.error('Error fetching tables:', error);
        return;
      }
      
      setTables(data);
    };
    
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching staff:', error);
        return;
      }
      
      // Cast the role from string to UserRole type
      setStaff(data.map(user => ({
        ...user,
        role: user.role as UserRole
      })));
    };
    
    fetchCategories();
    fetchProducts();
    fetchTables();
    fetchStaff();
  }, []);
  
  // Reset form states
  const resetCategoryForm = () => {
    setCategoryName('');
    setEditingCategory(null);
  };
  
  const resetProductForm = () => {
    setProductName('');
    setProductPrice('');
    setProductCategory('');
    setEditingProduct(null);
  };
  
  const resetTableForm = () => {
    setTableNumber('');
    setTableActive(true);
    setEditingTable(null);
  };
  
  const resetStaffForm = () => {
    setStaffName('');
    setStaffCode('');
    setStaffRole('waiter');
    setEditingStaff(null);
  };
  
  // Open dialog for creating/editing
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      resetCategoryForm();
    }
    setCategoryDialog(true);
  };
  
  const openProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductPrice(product.price.toString());
      setProductCategory(product.category_id || '');
    } else {
      resetProductForm();
    }
    setProductDialog(true);
  };
  
  const openTableDialog = (table?: TableType) => {
    if (table) {
      setEditingTable(table);
      setTableNumber(table.number.toString());
      setTableActive(table.active);
    } else {
      resetTableForm();
    }
    setTableDialog(true);
  };
  
  const openStaffDialog = (staff?: User) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffName(staff.name);
      setStaffCode(staff.code || '');
      setStaffRole(staff.role);
    } else {
      resetStaffForm();
    }
    setStaffDialog(true);
  };
  
  // Handle form submissions
  const handleCategorySubmit = async () => {
    try {
      if (!categoryName.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El nombre de la categoría es obligatorio",
        });
        return;
      }
      
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast({
          title: "Categoría actualizada",
          description: "La categoría ha sido actualizada correctamente",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert({ name: categoryName });
        
        if (error) throw error;
        
        toast({
          title: "Categoría creada",
          description: "La categoría ha sido creada correctamente",
        });
      }
      
      // Refresh categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data);
      setCategoryDialog(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la categoría",
      });
    }
  };
  
  const handleProductSubmit = async () => {
    try {
      if (!productName.trim() || !productPrice || !productCategory) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Todos los campos son obligatorios",
        });
        return;
      }
      
      const parsedPrice = parseFloat(productPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El precio debe ser un número positivo",
        });
        return;
      }
      
      const productData = {
        name: productName,
        price: parsedPrice,
        category_id: productCategory
      };
      
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert(productData);
        
        if (error) throw error;
        
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado correctamente",
        });
      }
      
      // Refresh products
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('name');
      
      if (error) throw error;
      
      setProducts(data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category_id: product.category_id,
        category: product.categories ? { id: product.category_id, name: product.categories.name } : undefined
      })));
      
      setProductDialog(false);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el producto",
      });
    }
  };
  
  const handleTableSubmit = async () => {
    try {
      if (!tableNumber.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El número de mesa es obligatorio",
        });
        return;
      }
      
      const parsedNumber = parseInt(tableNumber);
      if (isNaN(parsedNumber) || parsedNumber <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El número de mesa debe ser un número positivo",
        });
        return;
      }
      
      // Check if table number already exists (except for the current editing table)
      const existingTable = tables.find(
        t => t.number === parsedNumber && (!editingTable || t.id !== editingTable.id)
      );
      
      if (existingTable) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Ya existe una mesa con ese número",
        });
        return;
      }
      
      const tableData = {
        number: parsedNumber,
        active: tableActive
      };
      
      if (editingTable) {
        // Update
        const { error } = await supabase
          .from('restaurant_tables')
          .update(tableData)
          .eq('id', editingTable.id);
        
        if (error) throw error;
        
        toast({
          title: "Mesa actualizada",
          description: "La mesa ha sido actualizada correctamente",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('restaurant_tables')
          .insert(tableData);
        
        if (error) throw error;
        
        toast({
          title: "Mesa creada",
          description: "La mesa ha sido creada correctamente",
        });
      }
      
      // Refresh tables
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('number');
      
      if (error) throw error;
      
      setTables(data);
      setTableDialog(false);
      resetTableForm();
    } catch (error) {
      console.error('Error saving table:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la mesa",
      });
    }
  };
  
  const handleStaffSubmit = async () => {
    try {
      if (!staffName.trim() || (staffRole !== 'admin' && !staffCode)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: staffRole !== 'admin' 
            ? "El nombre y código PIN son obligatorios"
            : "El nombre es obligatorio",
        });
        return;
      }
      
      // Check if code is already used (except for the current editing staff)
      if (staffCode) {
        const existingStaff = staff.find(
          s => s.code === staffCode && (!editingStaff || s.id !== editingStaff.id)
        );
        
        if (existingStaff) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Ya existe un empleado con ese código PIN",
          });
          return;
        }
      }
      
      const staffData = {
        name: staffName,
        code: staffRole !== 'admin' ? staffCode : null,
        role: staffRole
      };
      
      if (editingStaff) {
        // Update
        const { error } = await supabase
          .from('users')
          .update(staffData)
          .eq('id', editingStaff.id);
        
        if (error) throw error;
        
        toast({
          title: "Empleado actualizado",
          description: "El empleado ha sido actualizado correctamente",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('users')
          .insert(staffData);
        
        if (error) throw error;
        
        toast({
          title: "Empleado creado",
          description: "El empleado ha sido creado correctamente",
        });
      }
      
      // Refresh staff
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Cast the role from string to UserRole type
      setStaff(data.map(user => ({
        ...user,
        role: user.role as UserRole
      })));
      
      setStaffDialog(false);
      resetStaffForm();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el empleado",
      });
    }
  };
  
  // Handle delete
  const handleDeleteCategory = async (id: string) => {
    try {
      // Check if there are products using this category
      const { data: productsWithCategory, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);
      
      if (checkError) throw checkError;
      
      if (productsWithCategory.length > 0) {
        toast({
          variant: "destructive",
          title: "No se puede eliminar",
          description: "Hay productos asociados a esta categoría",
        });
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(c => c.id !== id));
      
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la categoría",
      });
    }
  };
  
  const handleDeleteProduct = async (id: string) => {
    try {
      // Check if there are order items using this product
      const { data: orderItemsWithProduct, error: checkError } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', id);
      
      if (checkError) throw checkError;
      
      if (orderItemsWithProduct.length > 0) {
        toast({
          variant: "destructive",
          title: "No se puede eliminar",
          description: "Hay pedidos que incluyen este producto",
        });
        return;
      }
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto",
      });
    }
  };
  
  const handleDeleteTable = async (id: string) => {
    try {
      // Check if there are orders using this table
      const { data: ordersWithTable, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', id);
      
      if (checkError) throw checkError;
      
      if (ordersWithTable.length > 0) {
        toast({
          variant: "destructive",
          title: "No se puede eliminar",
          description: "Hay pedidos asociados a esta mesa",
        });
        return;
      }
      
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTables(tables.filter(t => t.id !== id));
      
      toast({
        title: "Mesa eliminada",
        description: "La mesa ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la mesa",
      });
    }
  };
  
  const handleDeleteStaff = async (id: string) => {
    try {
      // Check if there are orders created by this staff member
      const { data: ordersWithStaff, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', id);
      
      if (checkError) throw checkError;
      
      if (ordersWithStaff.length > 0) {
        toast({
          variant: "destructive",
          title: "No se puede eliminar",
          description: "Hay pedidos creados por este empleado",
        });
        return;
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStaff(staff.filter(s => s.id !== id));
      
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el empleado",
      });
    }
  };

  // Get order history
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
  const fetchOrderHistory = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(id, product_id, quantity, products:product_id(name, price)),
          tables:restaurant_tables!orders_table_id_fkey(number),
          users!orders_user_id_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el historial de pedidos",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const calculateOrderTotal = (order: any) => {
    return order.order_items.reduce((total: number, item: any) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0).toFixed(2);
  };
  
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
              <TabsTrigger value="history" onClick={fetchOrderHistory}>Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Gestión de Categorías</CardTitle>
                      <CardDescription>
                        Crear y editar categorías del menú
                      </CardDescription>
                    </div>
                    <Button onClick={() => openCategoryDialog()}>
                      <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {categories.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No hay categorías</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell>{category.name}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => openCategoryDialog(category)}>
                                  <Pencil size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Gestión de Productos</CardTitle>
                      <CardDescription>
                        Crear, editar y eliminar productos del menú
                      </CardDescription>
                    </div>
                    <Button onClick={() => openProductDialog()}>
                      <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {products.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No hay productos</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.price.toFixed(2)}€</TableCell>
                              <TableCell>{product.category?.name}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => openProductDialog(product)}>
                                  <Pencil size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tables">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Gestión de Mesas</CardTitle>
                    <CardDescription>
                      Crear, editar y eliminar mesas del local
                    </CardDescription>
                  </div>
                  <Button onClick={() => openTableDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Mesa
                  </Button>
                </CardHeader>
                <CardContent>
                  {tables.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No hay mesas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tables.map((table) => (
                          <TableRow key={table.id}>
                            <TableCell>{table.number}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                table.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {table.active ? 'Activa' : 'Inactiva'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openTableDialog(table)}>
                                <Pencil size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteTable(table.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="staff">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Gestión de Personal</CardTitle>
                    <CardDescription>
                      Crear usuarios con nombre, código PIN, y rol
                    </CardDescription>
                  </div>
                  <Button onClick={() => openStaffDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
                  </Button>
                </CardHeader>
                <CardContent>
                  {staff.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No hay personal</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.map((staffMember) => (
                          <TableRow key={staffMember.id}>
                            <TableCell>{staffMember.name}</TableCell>
                            <TableCell>{staffMember.code || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                staffMember.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : staffMember.role === 'waiter'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {staffMember.role === 'admin' ? 'Administrador' : 
                                 staffMember.role === 'waiter' ? 'Camarero' : 'Cocina'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => openStaffDialog(staffMember)}>
                                <Pencil size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(staffMember.id)}>
                                <Trash2 size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pedidos</CardTitle>
                  <CardDescription>
                    Ver pedidos históricos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Cargando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No hay pedidos registrados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Mesa</TableHead>
                          <TableHead>Camarero</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell>{formatDateTime(order.created_at)}</TableCell>
                            <TableCell>{order.tables?.number}</TableCell>
                            <TableCell>{order.users?.name}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : order.status === 'preparing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {order.status === 'pending' ? 'Pendiente' : 
                                 order.status === 'preparing' ? 'Preparando' : 'Listo'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{calculateOrderTotal(order)}€</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Modifica los detalles de la categoría existente.' 
                : 'Introduce los detalles para crear una nueva categoría.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nombre</Label>
              <Input 
                id="categoryName" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
                placeholder="Nombre de la categoría"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancelar</Button>
            <Button onClick={handleCategorySubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Modifica los detalles del producto existente.' 
                : 'Introduce los detalles para crear un nuevo producto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="productName">Nombre</Label>
              <Input 
                id="productName" 
                value={productName} 
                onChange={(e) => setProductName(e.target.value)} 
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Precio (€)</Label>
              <Input 
                id="productPrice" 
                type="number" 
                step="0.01" 
                min="0" 
                value={productPrice} 
                onChange={(e) => setProductPrice(e.target.value)} 
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Categoría</Label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog(false)}>Cancelar</Button>
            <Button onClick={handleProductSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Table Dialog */}
      <Dialog open={tableDialog} onOpenChange={setTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Editar Mesa' : 'Nueva Mesa'}</DialogTitle>
            <DialogDescription>
              {editingTable 
                ? 'Modifica los detalles de la mesa existente.' 
                : 'Introduce los detalles para crear una nueva mesa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Número</Label>
              <Input 
                id="tableNumber" 
                type="number" 
                min="1" 
                value={tableNumber} 
                onChange={(e) => setTableNumber(e.target.value)} 
                placeholder="Número de mesa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableActive">Estado</Label>
              <Select 
                value={tableActive ? "active" : "inactive"} 
                onValueChange={(value) => setTableActive(value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialog(false)}>Cancelar</Button>
            <Button onClick={handleTableSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Staff Dialog */}
      <Dialog open={staffDialog} onOpenChange={setStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
            <DialogDescription>
              {editingStaff 
                ? 'Modifica los detalles del empleado existente.' 
                : 'Introduce los detalles para crear un nuevo empleado.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staffName">Nombre</Label>
              <Input 
                id="staffName" 
                value={staffName} 
                onChange={(e) => setStaffName(e.target.value)} 
                placeholder="Nombre del empleado"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffRole">Rol</Label>
              <Select value={staffRole} onValueChange={(value) => setStaffRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="waiter">Camarero</SelectItem>
                  <SelectItem value="kitchen">Cocina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {staffRole !== 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="staffCode">Código PIN</Label>
                <Input 
                  id="staffCode" 
                  value={staffCode} 
                  onChange={(e) => setStaffCode(e.target.value)} 
                  placeholder="Código PIN para acceso"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStaffDialog(false)}>Cancelar</Button>
            <Button onClick={handleStaffSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
