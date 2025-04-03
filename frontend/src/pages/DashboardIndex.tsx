// src/pages/DashboardIndex.tsx
import React, { useEffect, useState } from 'react';
import Mapa from '../components/dashboard/Mapa';
import Sensores from '../components/dashboard/Sensores';
import LineChart from '../components/dashboard/LineChart';
import BarChart from '../components/dashboard/BarChart';
import '../index.css'
import RadarChart from '../components/dashboard/RadarChart';
import { sensorService } from '../services/sensorService';
import { LoopOutlined } from '@mui/icons-material';

export default function DashboardIndex() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading initial data in DashboardIndex...');
        await sensorService.fetchAndStoreData();
        console.log('Initial data loaded successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Error al cargar datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    // Cargar datos inicialmente
    loadData();

    // Actualizar cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-[var(--text-black)] font-bold">Mapa y sensores</h1>
        <button
          onClick={async () => {
            try {
              setLoading(true);
              await sensorService.fetchAndStoreData();
              console.log('Datos actualizados manualmente');
            } catch (error) {
              console.error('Error al actualizar datos:', error);
              setError('Error al actualizar datos');
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-sky-500 text-white rounded transition delay-100 duration-300 ease-in-out 
          hover:bg-sky-700 hover:-translate-y-1 hover:scale-110"
        >
          <LoopOutlined className="mr-2" />
          Actualizar datos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h2 className="text-lg font-base text-[var(--text-black)] mb-4">Mapa de parcelas</h2>
            <div className="h-[480px]">
              <Mapa />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-base text-[var(--text-black)] mb-4">Datos generales</h2>
            <Sensores />
          </div>
        </div>
      </div>
      
      {/* Sección de Gráficas */}

      <section>
        <h2 className="text-2xl text-[var(--text-black)] font-bold mt-10 mb-6">Gráficas y métricas de los sensores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <LineChart />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <BarChart />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <RadarChart />
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500 mt-8">
        © 2025. LeaderCode - Todos los derechos reservados.
      </footer>
    </div>
  );
}