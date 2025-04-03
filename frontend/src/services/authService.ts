// src/services/authService.ts
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    apellidos: string;
  };
}

interface SecurityQuestionResponse {
  success: boolean;
  message: string;
  pregunta_seguridad: string;
}

interface RegisterData {
  nombre: string;
  apellidos: string;
  correo: string;
  contraseña: string;
  pregunta_seguridad: string;
  //respuesta_seguridad: string;
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message: string;
    };
  };
}

export const authService = {
  async login(email: string, password: string, securityAnswer: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', {
        correo: email,
        contraseña: password,
        respuesta_seguridad: securityAnswer
      });
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error al iniciar sesión';
      console.error('Error en login:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async register(data: RegisterData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error al registrar usuario';
      console.error('Error en registro:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async getSecurityQuestion(email: string): Promise<SecurityQuestionResponse> {
    try {
      const response = await api.post('/auth/security-question', { correo: email });
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Error al obtener pregunta de seguridad';
      console.error('Error al obtener pregunta de seguridad:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  async loginWithGoogle(): Promise<LoginResponse> {
    try {
      console.log('Iniciando proceso de login con Google...');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('Abriendo popup de Google...');
      const result = await signInWithPopup(auth, provider);
      console.log('Popup cerrado, obteniendo token...');
      
      const idToken = await result.user.getIdToken();
      console.log('Token obtenido, enviando al backend...');

      const response = await api.post('/auth/google', { token: idToken });
      console.log('Respuesta del backend:', response.data);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Error al iniciar sesión con Google');
      }
    } catch (error: unknown) {
      console.error('Error detallado en login con Google:', error);
      const apiError = error as ApiError;
      if (apiError.response) {
        console.error('Respuesta del servidor:', apiError.response.data);
        throw new Error(apiError.response.data.message || 'Error al iniciar sesión con Google');
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      // Cerrar sesión en Firebase
      await signOut(auth);
      
      // Limpiar datos del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpiar cualquier dato en memoria
      auth.currentUser = null;
      
      console.log('Sesión cerrada y datos limpiados correctamente');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject
      );
    });
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
};
