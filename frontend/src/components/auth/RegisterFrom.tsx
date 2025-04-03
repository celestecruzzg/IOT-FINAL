import { useState } from "react";
import { toast } from "react-hot-toast";
import { CiUser, CiMail, CiLock, CiCircleQuestion } from "react-icons/ci";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Spinner
import Logo from "../../assets/icons/logo.svg";
import { authService } from "../../services/authService"; // Asegúrate de importar el servicio de auth

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    correo: "",
    contraseña: "",
    preguntaSeguridad: ""
  });
  
  const [errors, setErrors] = useState({ correo: "", contraseña: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Expresiones regulares
  const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if ((name === "nombre" || name === "apellidos") && !regexNombre.test(value) && value !== "") {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "correo") {
      setErrors(prev => ({ ...prev, correo: regexCorreo.test(value) ? "" : "Correo inválido" }));
    }

    if (name === "contraseña") {
      setErrors(prev => ({ ...prev, contraseña: regexPassword.test(value) ? "" : "Debe tener al menos 6 caracteres, una mayúscula y un carácter especial" }));
    }
  };

  // Registrar usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellidos || !formData.correo || !formData.contraseña || !formData.preguntaSeguridad) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (errors.correo || errors.contraseña) {
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setLoading(true);
    toast.loading("Registrando cuenta...");

    try {
      const response = await authService.register({
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        correo: formData.correo,
        contraseña: formData.contraseña,
        pregunta_seguridad: formData.preguntaSeguridad
      });

      toast.dismiss();
      if (response.success) {
        toast.success("Registro exitoso 🎉");
        onSwitchToLogin();
        console.log("Registro con:", formData);
      } else {
        toast.error(response.message || "Error al registrar cuenta");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "Error al registrar cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-md mx-auto py-12 px-8 bg-white shadow-md">
      <div className="flex-col justify-items-center space-y-6">
        <img src={Logo} alt="Logo" className="w-38 mx-auto" />
        <h2 className="text-xl font-semibold text-center mb-6 text-[var(--text-black)]">¡Regístrate ahora!</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-8">
        {/* NOMBRE */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">NOMBRE</label>
          <div className="relative">
            <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Jesús Emmanuel"
              className="pl-10 text-sm w-full px-4 py-2 border-b focus:outline-none focus:border-[var(--text-blue)]"
              required
            />
          </div>
        </div>

        {/* APELLIDOS */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">APELLIDOS</label>
          <div className="relative">
            <CiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="González Cruz"
              className="pl-10 text-sm w-full px-4 py-2 border-b focus:outline-none focus:border-[var(--text-blue)]"
              required
            />
          </div>
        </div>

        {/* CORREO */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">CORREO</label>
          <div className="relative">
            <CiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="example@example.com"
              className="pl-10 text-sm w-full px-4 py-2 border-b focus:outline-none focus:border-[var(--text-blue)]"
              required
            />
          </div>
          {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
        </div>

        {/* CONTRASEÑA */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">CONTRASEÑA</label>
          <div className="relative">
            <CiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              placeholder="*************"
              className="pl-10 text-sm w-full px-4 py-2 border-b focus:outline-none focus:border-[var(--text-blue)] pr-10"
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
          {errors.contraseña && <p className="text-red-500 text-xs mt-1">{errors.contraseña}</p>}
        </div>

        {/* PREGUNTA DE SEGURIDAD */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-blue)] mb-1">PREGUNTA DE SEGURIDAD</label>
          <div className="relative">
            <CiCircleQuestion className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="preguntaSeguridad"
              value={formData.preguntaSeguridad}
              onChange={handleChange}
              placeholder="¿Cuál es tu animal favorito?"
              className="pl-10 text-sm w-full px-4 py-2 border-b focus:outline-none focus:border-[var(--text-blue)]"
              required
            />
          </div>
        </div>

        {/* Botón de Registro */}
        <button
          type="submit"
          className="w-full bg-[var(--text-blue)] text-white py-2 px-4 rounded-lg flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : "Registrarse"}
        </button>
      </form>

      {/* Login */}
      <div className="mt-4 text-center text-xs text-gray-600">
        <p>
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-[var(--text-blue)] hover:underline font-medium cursor-pointer"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
};
