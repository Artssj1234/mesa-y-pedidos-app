import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { validarUsuario } from '@/lib/auth'; // asegúrate de tener este archivo creado
import { useNavigate } from 'react-router-dom';

const PinInput = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNumberClick = (number: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const user = await validarUsuario(pin, pin); // usuario = contraseña = pin
    setIsLoading(false);

    if (user) {
      localStorage.setItem('usuario', user.usuario);
      localStorage.setItem('rol', user.rol);

      // Redirección según el rol
      if (user.rol === 'admin') navigate('/admin');
      else if (user.rol === 'camarero') navigate('/camarero');
      else if (user.rol === 'cocina') navigate('/cocina');
      else alert('Rol no reconocido');
    } else {
      alert('PIN incorrecto');
      setPin('');
    }
  };

  const renderDigit = (index: number) => {
    return (
      <div
        key={index}
        className={`w-12 h-16 flex items-center justify-center border-2 rounded-md text-2xl
                    ${pin.length > index ? 'border-primary' : 'border-gray-300'}`}
      >
        {pin.length > index ? '•' : ''}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Introduzca su PIN</CardTitle>
        <CardDescription className="text-center">
          Ingrese su código de acceso para iniciar sesión
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex justify-center space-x-4 mb-8">
          {[0, 1, 2, 3].map(index => renderDigit(index))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <Button
              key={number}
              variant="outline"
              size="lg"
              className="h-16 text-2xl"
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </Button>
          ))}

          <Button
            variant="outline"
            size="lg"
            className="h-16"
            onClick={handleClear}
          >
            Borrar
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl"
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-16"
            onClick={handleBackspace}
          >
            ←
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={pin.length !== 4 || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Cargando...' : 'Acceder'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PinInput;
