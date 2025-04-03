// src/services/api.ts
import axios, { AxiosError } from "axios";
import { SensorData } from '../types/sensor';

const BACKEND_URL = 'http://localhost:5000/api';

// Crear una instancia de axios con configuración por defecto
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  // No agregar el token a las rutas de autenticación
  if (config.url?.startsWith('/auth/')) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token found and added to request:', token.substring(0, 10) + '...');
  } else {
    console.warn('No token found in localStorage');
    // Redirigir al login si no hay token
    window.location.href = '/login';
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export interface ParcelaHistory {
  id: number;
  parcela_id: number;
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
  fecha_registro: string;
}

export interface ParcelaEliminada {
  id: number;
  parcela_id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  tipo_cultivo: string;
  ultimo_riego: string;
  latitud: number;
  longitud: number;
  user_id: number;
  fecha_eliminacion: string;
  motivo: string;
}

export const fetchSensorData = async (): Promise<SensorData> => {
  try {
    console.log('Fetching sensor data...');
    const response = await api.get('/sensors/history/general');
    console.log('API Response:', { url: '/sensors/history/general', status: response.status, data: response.data });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener datos');
    }

    // Obtener datos de parcelas
    const parcelasResponse = await api.get('/sensors/parcelas');
    console.log('Backend response:', parcelasResponse.data);

    // Transformar los datos al formato esperado
    const transformedData: SensorData = {
      sensores: {
        humedad: response.data.data.humedad,
        temperatura: response.data.data.temperatura,
        lluvia: response.data.data.lluvia,
        sol: response.data.data.sol,
        created_at: response.data.data.created_at
      },
      historial: response.data.historial || [], // Usar el historial completo de la respuesta
      parcelas: parcelasResponse.data.parcelas || []
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    throw error;
  }
};

export const getParcelaHistory = async (parcelaId: number): Promise<ParcelaHistory[]> => {
  try {
    console.log(`Fetching history for parcela ${parcelaId}...`);
    const response = await api.get(`/history/parcela/${parcelaId}`);
    console.log(`History received for parcela ${parcelaId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching history for parcela ${parcelaId}:`, error);
    throw error;
  }
};

export const sensorService = {
  async fetchAndStoreData() {
    try {
      const response = await api.get('/sensors/fetch');
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener y almacenar datos';
    }
  },

  async getGeneralHistory() {
    try {
      const response = await api.get('/sensors/history/general');
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener histórico general';
    }
  },

  async getParcelaHistory(parcelaId: number) {
    try {
      const response = await api.get(`/sensors/history/parcela/${parcelaId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Error al obtener histórico de parcela';
    }
  },

  async getParcelasEliminadas() {
    try {
      console.log('Iniciando llamada a getParcelasEliminadas...');
      const token = localStorage.getItem('token');
      console.log('Token disponible:', !!token);
      
      const response = await api.get('/sensors/history/parcelas-eliminadas');
      console.log('Respuesta completa del servidor:', response);
      console.log('Datos de parcelas eliminadas:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error detallado en getParcelasEliminadas:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data?.message || 'Error al obtener histórico de parcelas eliminadas';
    }
  }
};
