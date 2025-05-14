
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('code', code)
        .in('role', ['waiter', 'kitchen'])
        .single();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Código PIN incorrecto",
        });
        return;
      }
      
      if (data) {
        const userData: User = {
          id: data.id,
          name: data.name,
          code: data.code,
          role: data.role as UserRole
        };
        
        setUser(userData);
        localStorage.setItem('restaurant_user', JSON.stringify(userData));
        
        if (userData.role === 'waiter') {
          navigate('/camarero');
        } else if (userData.role === 'kitchen') {
          navigate('/cocina');
        }
        
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido, ${userData.name}`,
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
      // Query the users table to check if an admin with the provided username exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', username)
        .eq('role', 'admin')
        .single();
      
      if (error || !data) {
        console.error('Admin login error:', error);
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Usuario no encontrado",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if the password matches - we'll use the 'code' field for password
      // If code is null, we'll use 'Admin' as default password for backward compatibility
      const expectedPassword = data.code || 'Admin';
      
      if (password === expectedPassword) {
        const userData: User = {
          id: data.id,
          name: data.name,
          role: data.role as UserRole,
          code: data.code
        };
        
        setUser(userData);
        localStorage.setItem('restaurant_user', JSON.stringify(userData));
        navigate('/admin');
        
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido, ${userData.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Contraseña incorrecta",
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
