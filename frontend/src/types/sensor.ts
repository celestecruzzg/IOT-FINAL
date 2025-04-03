// src/types/sensor.ts
export interface SensorReading {
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
  created_at: string;
}

export interface Parcela {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  tipo_cultivo: string;
  ultimo_riego: string;
  sensor: SensorReading;
  latitud: number;
  longitud: number;
}

export interface SensorData {
  sensores: SensorReading;
  historial: SensorReading[];
  parcelas: Parcela[];
}

export interface ApiResponse {
  success: boolean;
  data: SensorReading[];
  message?: string;
}