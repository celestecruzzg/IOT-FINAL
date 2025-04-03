import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Si el usuario está autenticado y va al login, se redirige a /dashboard
  if (isAuthenticated && location.pathname === "/login") {
    logout(); // Limpiar la sesión
    return <Navigate to="/dashboard" replace />; // Redirigir al dashboard
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
