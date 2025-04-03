// src/components/dashboard/RadarChart.tsx
import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface WeatherAnalysis {
  description: string;
  icon: string;
  color: string;
}

const RadarChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [weatherAnalysis, setWeatherAnalysis] = useState<WeatherAnalysis | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const analyzeWeather = (reading: { temperatura: number, humedad: number, lluvia: number }): WeatherAnalysis => {
    const { temperatura, humedad, lluvia } = reading;

    if (temperatura >= 30) {
      return humedad >= 70 
        ? { description: "Caluroso y húmedo", icon: "🌡️", color: "text-red-500" }
        : { description: "Caluroso y seco", icon: "☀️", color: "text-orange-500" };
    } else if (temperatura <= 15) {
      return humedad >= 70
        ? { description: "Frío y húmedo", icon: "❄️", color: "text-blue-500" }
        : { description: "Frío y seco", icon: "🌡️", color: "text-blue-400" };
    }

    if (lluvia > 0) {
      return lluvia >= 5
        ? { description: "Lluvia intensa", icon: "🌧️", color: "text-blue-600" }
        : { description: "Lluvia ligera", icon: "🌦️", color: "text-blue-500" };
    }

    return { description: "Condiciones estables", icon: "🌤️", color: "text-green-500" };
  };

  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const { humedad, temperatura, lluvia, lastUpdated } = event.detail;
      
      setChartData({
        labels: ['Temperatura', 'Humedad', 'Lluvia'],
        datasets: [
          {
            label: 'Valores Actuales',
            data: [temperatura, humedad, lluvia ],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3B82F6',
            borderWidth: 2,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#3B82F6',
          },
        ],
      });

      setWeatherAnalysis(analyzeWeather({ temperatura, humedad, lluvia }));
      setLastUpdated(lastUpdated);
    };

    window.addEventListener('sensorDataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('sensorDataUpdated', handleDataUpdate as EventListener);
    };
  }, []);

  if (!chartData) {
    return <div className="flex items-center justify-center h-full">Cargando datos del radar...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 p-3">
        <h2 className="text-[18px] font-semibold text-[var(--text-black)]">
          Análisis climático actual con relación a lluvia, humedad y temperatura
        </h2>
        <span className="text-xs text-gray-500">{lastUpdated}</span>
      </div>
      
      {weatherAnalysis && (
        <div className={`text-center mb-2 ${weatherAnalysis.color}`}>
          <span className="text-2xl mr-2">{weatherAnalysis.icon}</span>
          <span className="font-medium">{weatherAnalysis.description}</span>
        </div>
      )}
      
      <div className="flex-1 min-h-[400px]">
        <Radar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
                labels: {
                  color: '#1F2937',
                  font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                  },
                  padding: 20,
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: '#FFFFFF',
                titleColor: '#1F2937',
                bodyColor: '#1F2937',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                  label: (context: any) => {
                    let label = context.dataset.label || '';
                    if (label) label += ': ';
                    if (context.parsed.r !== null) {
                      label += context.parsed.r.toFixed(1) + 
                        (context.label === 'Temperatura' ? '°C' : 
                         context.label === 'Humedad' || context.label === 'Radiación ar' ? '%' : 'mm');
                    }
                    return label;
                  },
                },
              },
            },
            scales: {
              r: {
                beginAtZero: true,
                grid: {
                  color: '#E5E7EB',
                },
                ticks: {
                  color: '#6B7280',
                  callback: (value: number) => value + (value === 0 ? '' : value === 100 ? '%' : ''),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default RadarChart;