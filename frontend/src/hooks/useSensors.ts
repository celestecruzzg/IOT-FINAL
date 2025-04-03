import { useState, useEffect } from 'react';
import { sensorService } from '../services/sensorService';
import { toast } from 'react-hot-toast';

export const useSensors = () => {
  const [sensorData, setSensorData] = useState<any>(null);
  const [generalHistory, setGeneralHistory] = useState<any[]>([]);
  const [parcelaHistory, setParcelaHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Obtener y almacenar datos (solo si cambiaron)
      const data = await sensorService.fetchAndStoreData();
      setSensorData(data.data);
      
      // Obtener histórico general
      const general = await sensorService.getGeneralHistory();
      setGeneralHistory(general.historial || []);
      
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchParcelaHistory = async (parcelaId: number) => {
    setLoading(true);
    try {
      const history = await sensorService.getParcelaHistory(parcelaId);
      setParcelaHistory(history.data);
      setSelectedParcela(parcelaId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al obtener histórico de parcela');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y configurar recolección periódica
  useEffect(() => {
    fetchData();
    
    // Iniciar recolección periódica de datos
    sensorService.startDataCollection();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    sensorData,
    generalHistory,
    parcelaHistory,
    loading,
    selectedParcela,
    fetchData,
    fetchParcelaHistory,
    setSelectedParcela
  };
};