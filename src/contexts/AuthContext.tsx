
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (code: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock data until we integrate with Supabase
const MOCK_USERS = [
  { id: '1', name: 'Admin User', role: 'admin' },
  { id: '2', name: 'Juan Camarero', code: '1234', role: 'waiter' },
  { id: '3', name: 'María Camarera', code: '5678', role: 'waiter' },
  { id: '4', name: 'Chef Carlos', role: 'kitchen' },
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('restaurant_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('restaurant_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (code: string) => {
    setIsLoading(true);
    try {
      // This would be replaced with a Supabase query
      const user = MOCK_USERS.find(u => u.code === code && (u.role === 'waiter' || u.role === 'kitchen'));
      
      if (user) {
        setUser(user);
        localStorage.setItem('restaurant_user', JSON.stringify(user));
        
        if (user.role === 'waiter') {
          navigate('/camarero');
        } else if (user.role === 'kitchen') {
          navigate('/cocina');
        }
        
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido, ${user.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Código PIN incorrecto",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error durante el inicio de sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // This would be replaced with a Supabase query
      // For demo purposes, accept any admin with password "admin"
      const user = MOCK_USERS.find(u => u.name.toLowerCase() === username.toLowerCase() && u.role === 'admin');
      
      if (user && password === 'admin') {
        setUser(user);
        localStorage.setItem('restaurant_user', JSON.stringify(user));
        navigate('/admin');
        
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido, ${user.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Credenciales incorrectas",
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ha ocurrido un error durante el inicio de sesión",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restaurant_user');
    navigate('/');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
