// src/components/dashboard/Sensors.tsx
import React, { useEffect, useState } from 'react';
import { sensorService } from '../../services/sensorService';

// Componente de ícono reutilizable
const SensorIcon = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
    {children}
  </div>
);

const HumidityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const TemperatureIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RainIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

interface SensorData {
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
  lastUpdated: string;
}

const Sensores: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    humedad: 0,
    temperatura: 0,
    lluvia: 0,
    sol: 0,
    lastUpdated: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentData = async () => {
    try {
      setIsLoading(true);
      const response = await sensorService.getGeneralHistory();
      
      if (response?.success && response.currentData) {
        const newData = {
          humedad: Number(response.currentData.humedad) || 0,
          temperatura: Number(response.currentData.temperatura) || 0,
          lluvia: Number(response.currentData.lluvia) || 0,
          sol: Number(response.currentData.sol) || 0,
          //lastUpdated: new Date().toLocaleTimeString()

        };
        
        setSensorData(newData);
        setError(null);
        
        // Emitir evento para actualizar otros componentes
        window.dispatchEvent(new CustomEvent('sensorDataUpdated', {
          detail: newData
        }));
      } else {
        setError('No se pudieron obtener los datos actuales');
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchCurrentData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full h-full">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gray-100 rounded-xl p-4 animate-pulse">
            <div className="h-6 w-6 bg-gray-300 rounded-lg mb-2"></div>
            <div className="h-4 w-20 bg-gray-300 rounded mb-3"></div>
            <div className="h-8 w-16 bg-gray-300 rounded mb-4"></div>
            <div className="h-2 w-full bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: <HumidityIcon />,
      iconColor: 'text-blue-500',
      title: 'Humedad',
      value: `${sensorData.humedad}%`,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      status: sensorData.humedad > 60 ? 'Alta' : sensorData.humedad < 30 ? 'Baja' : 'Normal'
    },
    {
      icon: <TemperatureIcon />,
      iconColor: 'text-red-500',
      title: 'Temperatura',
      value: `${sensorData.temperatura}°C`,
      bg: 'bg-red-50',
      border: 'border-red-100',
      status: sensorData.temperatura > 28 ? 'Alta' : sensorData.temperatura < 15 ? 'Baja' : 'Normal'
    },
    {
      icon: <RainIcon />,
      iconColor: 'text-indigo-500',
      title: 'Lluvia',
      value: `${sensorData.lluvia}mm`,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      status: sensorData.lluvia > 5 ? 'Alta' : sensorData.lluvia > 0 ? 'Ligera' : 'Sin lluvia'
    },
    {
      icon: <SunIcon />,
      iconColor: 'text-amber-500',
      title: 'Radiación Solar',
      value: `${sensorData.sol}%`,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      status: sensorData.sol > 70 ? 'Alta' : sensorData.sol < 30 ? 'Baja' : 'Moderada'
    }
  ];

  return (
    <div className="relative">
      {/* <div className="absolute top-0 right-0 text-xs text-gray-500 p-2">
        Actualizado: {sensorData.lastUpdated}
      </div>
       */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3 w-full h-full">
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`${card.bg} border ${card.border} rounded-xl p-4 flex flex-col shadow-sm`}
          >
            <div className="flex justify-between items-start">
              <SensorIcon color={card.iconColor}>{card.icon}</SensorIcon>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                card.status.includes('Alta') ? 'bg-green-100 text-green-800' :
                card.status.includes('Baja') || card.status.includes('Sin') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {card.status}
              </span>
            </div>
            
            <h3 className="text-gray-500 text-sm font-medium mt-2">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
            
            <div className="mt-3">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${card.iconColor.replace('text-', 'bg-')}`}
                  style={{ 
                    width: `${index === 0 ? sensorData.humedad : 
                            index === 1 ? Math.min(sensorData.temperatura * 3, 100) : 
                            index === 2 ? Math.min(sensorData.lluvia * 10, 100) : 
                            sensorData.sol}%`,
                    maxWidth: '100%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sensores;