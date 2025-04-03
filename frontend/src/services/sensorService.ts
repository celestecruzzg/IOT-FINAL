import api from './api';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const sensorService = {
  async fetchAndStoreData() {
    try {
      console.log('Fetching and storing data...');
      const response = await api.get('/sensors/fetch');
      console.log('Response from fetchAndStoreData:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener y almacenar datos');
      }
      
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in fetchAndStoreData:', apiError);
      throw apiError.response?.data?.message || 'Error al obtener y almacenar datos';
    }
  },

  async getParcelas() {
    try {
      console.log('Fetching parcelas data...');
      const response = await api.get('/sensors/parcelas');
      console.log('Response from getParcelas:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in getParcelas:', apiError);
      throw apiError.response?.data?.message || 'Error al obtener datos de parcelas';
    }
  },

  //en caso de q el mapa deba tener los pines por el api y no por lo regitsrado en la bd
  async getParcelasAPI() {
    try {
      console.log('Fetching parcelas data...');
      const response = await api.get('/sensors/parcelasAPI');
      console.log('Response from getParcelasAPI:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in getParcelasAPI:', apiError);
      throw apiError.response?.data?.message || 'Error al obtener datos de parcelas';
    }
  },

  async getGeneralHistory() {
    try {
      console.log('Fetching general history...');
      const response = await api.get('/sensors/history/general');
      console.log('Response from getGeneralHistory:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in getGeneralHistory:', apiError);
      throw apiError.response?.data?.message || 'Error al obtener histórico general';
    }
  },

  async getParcelaHistory(parcelaId: number) {
    try {
      console.log(`Fetching history for parcela ${parcelaId}...`);
      const response = await api.get(`/sensors/history/parcela/${parcelaId}`);
      console.log(`Response from getParcelaHistory for ${parcelaId}:`, response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error(`Error in getParcelaHistory for ${parcelaId}:`, apiError);
      throw apiError.response?.data?.message || 'Error al obtener histórico de parcela';
    }
  },

  async getParcelasEliminadas() {
    try {
      console.log('Fetching deleted parcelas...');
      const response = await api.get('/sensors/history/parcelas-eliminadas');
      console.log('Response from getParcelasEliminadas:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Error in getParcelasEliminadas:', apiError);
      throw apiError.response?.data?.message || 'Error al obtener parcelas eliminadas';
    }
  },

  // Método para iniciar la recolección periódica de datos
  startDataCollection() {
    // Obtener y almacenar datos cada 5 minutos
    setInterval(async () => {
      try {
        await this.fetchAndStoreData();
        console.log('Datos actualizados correctamente');
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error('Error al actualizar datos:', apiError);
      }
    }, 1 * 60 * 1000); // 1 minutos
  }
};
