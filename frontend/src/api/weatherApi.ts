// src/api/weatherApi.ts
import axios from 'axios';

const API_URL = 'https://iot-final-production.up.railway.app/sensors/all';

export interface SensorData {
  time: string;
  field: 'humedad' | 'presion' | 'tempDHT';
  value: number;
}

export const fetchWeatherData = async (): Promise<SensorData[]> => {
  const response = await axios.get<SensorData[]>(API_URL);
  return response.data;
};