// src/components/WeatherChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
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
import { WeatherData } from '../types/weather';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherChartProps {
  data: WeatherData[];
}

const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => 
      item.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data.map(item => item.temperature),
        borderColor: '#E39797',
        backgroundColor: '#E39797',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Humedad (%)',
        data: data.map(item => item.humidity),
        borderColor: '#DFEFFF',
        backgroundColor: '#DFEFFF',
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Presión (hPa)',
        data: data.map(item => item.pressure),
        borderColor: '#C8B8FF',
        backgroundColor: '#C8B8FF',
        tension: 0.4,
        yAxisID: 'y2',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperatura (°C)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Humedad (%)',
        },
        min: 0,
        max: 100,
      },
      y2: {
        type: 'linear' as const,
        display: false,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        min: 950,
        max: 1050,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Tendencias históricas</h3>
      <p className="text-sm text-gray-600 mb-4">Patrones climáticos de las últimas 24 horas</p>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WeatherChart;