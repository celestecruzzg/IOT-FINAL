import { sensorService } from '../services/sensorService';

async function testFetch() {
  try {
    console.log('=== Iniciando prueba de fetchAndStoreData ===');
    
    // Verificar token
    const token = localStorage.getItem('token');
    console.log('Token encontrado:', !!token);
    if (token) {
      console.log('Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
    }

    // Hacer la petición
    console.log('Haciendo petición a /sensors/fetch...');
    const response = await sensorService.fetchAndStoreData();
    
    // Mostrar respuesta
    console.log('=== Respuesta del servidor ===');
    console.log('Success:', response.success);
    console.log('Message:', response.message);
    
    // Mostrar detalles de parcelas
    console.log('\n=== Detalles de Parcelas ===');
    console.log('Número de parcelas:', response.parcelas?.length || 0);
    if (response.parcelas && response.parcelas.length > 0) {
      console.log('Primera parcela:', {
        id: response.parcelas[0].id,
        nombre: response.parcelas[0].nombre,
        ubicacion: response.parcelas[0].ubicacion
      });
    }
    
    // Mostrar detalles de sensores
    console.log('\n=== Detalles de Sensores ===');
    if (response.sensores) {
      console.log('Datos de sensores:', {
        humedad: response.sensores.humedad,
        temperatura: response.sensores.temperatura,
        lluvia: response.sensores.lluvia,
        sol: response.sensores.sol
      });
    }
    
    // Mostrar detalles de parcelas eliminadas
    console.log('\n=== Detalles de Parcelas Eliminadas ===');
    console.log('Número de parcelas eliminadas:', response.deletedParcelas?.length || 0);
    
    if (response.success) {
      console.log('\n✅ Datos almacenados correctamente');
    } else {
      console.log('\n❌ Error al almacenar datos:', response.message);
    }
  } catch (error) {
    console.error('=== Error en la petición ===');
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
console.log('Ejecutando prueba...');
testFetch(); 