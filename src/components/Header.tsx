
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
}

const Header = ({ title, showLogout = true }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-4 py-3 sm:px-6">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600">
              Hola, <span className="font-medium">{user.name}</span>
            </div>
          )}
          
          {showLogout && user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="text-sm"
            >
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
