// src/components/dashboard/LineChart.tsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { sensorService } from '../../services/sensorService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorReading {
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
  created_at: string;
}

interface ChartContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

const LineChart: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for LineChart...');
        const response = await sensorService.getGeneralHistory();
        console.log('Response from getGeneralHistory:', response);
        
        if (response && response.success && response.historial) {
          // Obtener las últimas 20 lecturas
          const last20Readings = response.historial.slice(-20);
          console.log('Last 20 readings:', last20Readings);
          
          setSensorData(last20Readings);
          setTimeLabels(last20Readings.map(reading => 
            new Date(reading.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          ));
          setError(null);
        } else {
          setError('Error al obtener datos del historial');
        }
      } catch (error) {
        console.error('Error loading sensor data:', error);
        setError('Error al cargar datos de sensores');
      }
    };

    // Cargar datos inicialmente
    loadData();

    // Actualizar cada minuto
    const interval = setInterval(loadData, 60 * 3000000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (!sensorData.length) {
    return <div className="flex items-center justify-center h-full">Cargando datos...</div>;
  }

  const data = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: sensorData.map(reading => reading.temperatura),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#EF4444',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Humedad (%)',
        data: sensorData.map(reading => reading.humedad),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#3B82F6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
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
        usePointStyle: true,
        callbacks: {
          label: (context: ChartContext) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + (label.includes('Temperatura') ? '°C' : '%');
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#E5E7EB',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 p-3">
      <h2 className="text-[18px] font-semibold text-[var(--text-black)]">
          Evolución de temperatura y humedad<br></br> (por cada actualización)
        </h2>
      </div>
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
