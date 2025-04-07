// src/App.tsx
import React, { useEffect, useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '../components/Header';
import LocationCard from '../components/LocationCard';
import MetricCard from '../components/MetricCard';
import WeatherChart from '../components/WeatherChart';
import { FiThermometer, FiDroplet, FiBarChart2 } from 'react-icons/fi';
import { SensorData } from '../api/weatherApi';
import { WeatherData } from '../types/weather';
import { fetchWeatherData } from '../api/weatherApi';

const queryClient = new QueryClient();

const transformData = (apiData: SensorData[]): { current: any, history: WeatherData[] } => {
  const current: any = {};
  const historyMap: Record<string, WeatherData> = {};
  
  apiData.forEach(item => {
    const timestamp = new Date(item.time);
    const timeKey = timestamp.toISOString();
    
    if (!historyMap[timeKey]) {
      historyMap[timeKey] = {
        timestamp,
        temperature: 0,
        humidity: 0,
        pressure: 0
      };
    }
    
    switch(item.field) {
      case 'tempDHT':
        current.temperature = item.value;
        historyMap[timeKey].temperature = item.value;
        break;
      case 'humedad':
        current.humidity = item.value;
        historyMap[timeKey].humidity = item.value;
        break;
      case 'presion':
        current.pressure = item.value;
        historyMap[timeKey].pressure = item.value;
        break;
    }
  });
  
  return {
    current,
    history: Object.values(historyMap).sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )
  };
};

const WeatherApp: React.FC = () => {
  const [weatherData, setWeatherData] = useState<{
    current: { temperature: number; humidity: number; pressure: number };
    history: WeatherData[];
  }>({
    current: { temperature: 0, humidity: 0, pressure: 0 },
    history: []
  });

  const { data, isLoading, error } = useQuery<SensorData[]>({
    queryKey: ['weatherData'],
    queryFn: fetchWeatherData,
    refetchInterval: 5000 // Actualizar cada 5 segundos
  });

  useEffect(() => {
    if (data) {
      const transformed = transformData(data);
      setWeatherData(transformed);
    }
  }, [data]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 p-6">Cargando...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 p-6">Error al cargar los datos</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header />
        <LocationCard />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Temperatura"
            value={weatherData.current.temperature}
            description="Temperatura actual registrada"
            icon={<FiThermometer className="text-xl text-[#CA1B1B]" />}
            color="#FFEAEA"
            border_color='#CA1B1B'
            bar_color="#CA1B1B"
            unit="°C"
            progressValue={(weatherData.current.temperature / 40) * 100}
          />
          <MetricCard
            title="Humedad"
            value={weatherData.current.humidity}
            description="Nivel de humedad relativa"
            icon={<FiDroplet className="text-xl text-[#0084FF]" />}
            color="#DFEFFF"
            border_color='#0084FF'
            bar_color="#0084FF"
            unit="%"
            progressValue={weatherData.current.humidity}
          />
          <MetricCard
            title="Presión"
            value={weatherData.current.pressure}
            description="Presión atmosférica"
            icon={<FiBarChart2 className="text-xl text-[#997CFF]" />}
            color="#C8B8FF"
            border_color='#997CFF'
            bar_color="#997CFF"
            unit="hPa"
            progressValue={((weatherData.current.pressure - 950) / 100) * 100}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeatherChart data={weatherData.history} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-4">Registros recientes</h3>
            <ul className="space-y-2">
              {weatherData.history.slice(-10).map((data, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {data.timestamp.toLocaleTimeString('es-MX', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="font-medium">
                    {data.temperature.toFixed(1)}°C / {data.humidity.toFixed(1)}% / {data.pressure.toFixed(1)}hPa
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
};

export default App;