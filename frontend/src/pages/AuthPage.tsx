import { useState, useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterFrom';
import Footer from '../Layouts/Footer';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const AuthPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex-col bg-[#F3F8FF] flex items-center justify-center p-4">
      <div className="w-full max-w-[450px] mx-auto">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
      <div className="absolute bottom-0 w-full py-4 px-16">
        <div className="py-[0.1px] bg-[var(--color-blue)]"></div>
        <Footer />
      </div>
    </div>
  );
};
