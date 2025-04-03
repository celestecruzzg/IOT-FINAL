import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de importar el contexto
import Avatar from '../assets/images/image.png'
import { CiLogout } from 'react-icons/ci';
import { authService } from '../services/authService';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth(); // Obtiene la función de cierre de sesión y el usuario del contexto

  // Agregar logs para depuración
  useEffect(() => {
    console.log('Datos del usuario en Header:', user);
  }, [user]);

  // Mapea la ruta actual a un título adecuado
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/dashboard/parcelas':
        return 'Parcelas';
      case '/dashboard/eliminados':
        return 'Eliminados';
      default:
        return 'Cultivos del Sur | Mapa de ubicaciones';
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-7">
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle(location.pathname)}
        </h1>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-5 focus:outline-none cursor-pointer"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700"> 
                  {user?.nombre || 'Usuario'}{user?.apellidos ? ` ${user.apellidos}` : ''}
              </p>
              <p className="text-xs text-gray-500">{user?.correo || "Correo no disponible"}</p>
            </div>
            <img
              className="h-12 w-12 rounded-full"
              src={Avatar}
              alt="User avatar"
            />
            <ChevronDownIcon className="text-gray-500" />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <button
                onClick={handleLogout}
                className=
                "flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <CiLogout/>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
