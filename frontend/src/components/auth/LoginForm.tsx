// src/components/auth/LoginForm.tsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
import Logo from "../../assets/icons/logo.svg";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import GoogleLoginButton from './GoogleLoginButton';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message: string;
    };
  };
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Validación de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de contraseña (mínimo 6 caracteres)
  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors({
      ...errors,
      email: validateEmail(e.target.value) ? "" : "Correo inválido",
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors({
      ...errors,
      password: validatePassword(e.target.value)
        ? ""
        : "La contraseña debe tener al menos 6 caracteres",
    });
  };

  // Enviar formulario con validaciones
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Ingrese un correo válido");
      return;
    }
    if (!validatePassword(password)) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Verificando credenciales...");
      
      // Primero obtener la pregunta de seguridad
      const response = await authService.getSecurityQuestion(email);
      
      if (response.success) {
        setSecurityQuestion(response.pregunta_seguridad);
        setIsModalOpen(true);
        toast.dismiss(loadingToast);
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.message || "Usuario no encontrado");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.dismiss();
      toast.error(apiError.message || "Error al obtener pregunta de seguridad");
    } finally {
      setLoading(false);
    }
  };

  // Manejo del submit del modal de seguridad
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityAnswer) {
      toast.error("Por favor ingrese la respuesta de seguridad");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Verificando credenciales...");

      const response = await authService.login(email, password, securityAnswer);
      
      toast.dismiss(loadingToast);
      if (response.success) {
        toast.success("Inicio de sesión exitoso");
        login(response.token, {
          id: response.user.id,
          nombre: response.user.nombre,
          apellidos: response.user.apellidos,
          correo: response.user.correo
        });
        setIsModalOpen(false);
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Error al iniciar sesión");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.dismiss();
      toast.error(apiError.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto py-12 px-8 bg-white shadow-md rounded-lg">
      <div className="flex-col justify-items-center space-y-6 mb-3">
        <img src={Logo} alt="Logo" className="w-38 mx-auto" />
        <h2 className="text-xl font-semibold text-center mb-10 text-[var(--text-black)]">
          ¡Bienvenido de nuevo!
        </h2>
      </div>

      {/* Correo */}
      <form onSubmit={handleSubmit} className="space-y-4 px-8">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">
            CORREO
          </label>
          <div className="relative">
            <EnvelopeClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="pl-10 text-sm w-full px-4 py-2 border-b text-[var(--text-black)] focus:outline-none focus:border-[var(--text-blue)]"
              placeholder="example@example.com"
              required
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">
            CONTRASEÑA
          </label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="pl-10 text-sm w-full px-4 py-2 border-b text-[var(--text-black)] focus:outline-none focus:border-[var(--text-blue)] pr-10"
              placeholder="************"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Olvidaste tu contraseña */}
        <div className="text-center">
          <a href="#" className="text-xs text-[var(--text-blue)] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón de Iniciar sesión con Spinner */}
        <button
          type="submit"
          className="relative flex items-center justify-center w-full bg-[var(--text-blue)] hover:bg-[var(--text-blue-dark)] text-white py-2 px-4 rounded-lg transition duration-200 cursor-pointer disabled:opacity-50"
          disabled={loading || errors.email !== "" || errors.password !== ""}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      {/* Registro */}
      <div className="mt-4 text-center text-xs text-gray-600">
        <p>
          ¿Aún no tienes cuenta?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-[var(--text-blue)] hover:underline font-medium cursor-pointer"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Modal de Pregunta de Seguridad */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="w-96 mx-auto p-6 bg-white rounded-xl shadow-lg"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
        ariaHideApp={false}
      >
        <h2 className="text-xl font-semibold text-[var(--text-black)] text-center mb-4">
          Pregunta de Seguridad
        </h2>
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <label className="block text-sm text-[var(--text-blue)] font-semibold">
            ¿Cuál es tu animal favorito?
          </label>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            className="w-full p-2 border rounded text-[var(--text-black)] focus:outline-none focus:border-[var(--text-blue)]"
            placeholder="Ingrese su respuesta"
            required
          />
          <button
            type="submit"
            className="w-full bg-[var(--text-blue)] hover:bg-[var(--text-blue-dark)] text-white py-2 px-4 rounded-lg transition duration-200 flex justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Verificar respuesta"
            )}
          </button>
        </form>
      </Modal>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};