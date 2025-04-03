import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { sensorService } from '../../services/sensorService'; // Importación del servicio
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Interface para los datos del sensor
interface SensorReading {
  humedad: number;
  temperatura: number;
  lluvia: number;
  sol: number;
  created_at: string;
}

const BarChart: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [chartData, setChartData] = useState({
    labels: ['Temperatura', 'Humedad', 'Lluvia', 'Sol'],
    datasets: [
      {
        label: 'Mínimo',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Máximo',
        data: [0, 0, 0, 0],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  });
  const chartRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener y procesar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sensorService.getGeneralHistory();
      
      if (response?.success) {
        let readings: SensorReading[] = [];
        
        // Procesar datos históricos
        if (response.historial) {
          readings = response.historial.slice(-20).map(reading => ({
            ...reading,
            temperatura: Number(reading.temperatura),
            humedad: Number(reading.humedad),
            lluvia: Number(reading.lluvia),
            sol: Number(reading.sol),
            created_at: reading.created_at || new Date().toISOString()
          }));
        }
        
        // Agregar datos actuales
        if (response.currentData) {
          readings.push({
            temperatura: Number(response.currentData.temperatura),
            humedad: Number(response.currentData.humedad),
            lluvia: Number(response.currentData.lluvia),
            sol: Number(response.currentData.sol),
            created_at: new Date().toISOString()
          });
        }
        
        // Ordenar por fecha
        readings.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        setSensorData(readings);
        updateChartData(readings);
        setError(null);
      } else {
        setError('No se pudieron obtener los datos');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar datos del gráfico
  const updateChartData = (data: SensorReading[]) => {
    if (data.length === 0) return;
    
    const newChartData = {
      labels: ['Temperatura', 'Humedad', 'Lluvia', 'Sol'],
      datasets: [
        {
          ...chartData.datasets[0],
          data: [
            Math.min(...data.map(r => r.temperatura)),
            Math.min(...data.map(r => r.humedad)),
            Math.min(...data.map(r => r.lluvia)),
            Math.min(...data.map(r => r.sol)),
          ]
        },
        {
          ...chartData.datasets[1],
          data: [
            Math.max(...data.map(r => r.temperatura)),
            Math.max(...data.map(r => r.humedad)),
            Math.max(...data.map(r => r.lluvia)),
            Math.max(...data.map(r => r.sol)),
          ]
        }
      ]
    };
    
    setChartData(newChartData);
    
    // Forzar actualización del gráfico
    if (chartRef.current) {
      chartRef.current.update();
    }
  };

  // Cargar datos iniciales y configurar intervalo
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 3000000); // Actualizar cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Opciones del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += context.parsed.y;
            label += context.label === 'Temperatura' ? '°C' : 
                    (context.label === 'Humedad' || context.label === 'Sol') ? '%' : 'mm';
            return label;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: false },
      x: { grid: { display: false } }
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando datos...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
      <h2 className="text-[18px] font-semibold text-[var(--text-black)]">
          Valores máximos y mínimos generales de los sensores
        </h2>
      </div>
      <div className="flex-1 min-h-[400px] p-4">
        <Bar 
          ref={chartRef}
          data={chartData}
          options={options}
          key={`chart-${sensorData.length}`}
        />
      </div>
    </div>
  );
};

export default BarChart;