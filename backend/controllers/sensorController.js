const axios = require('axios');
const { pool, testConnection } = require('../config/db');
const { generateHash } = require('../utils/hashUtils');

class SensorController {
  async fetchAndStoreData(req, res) {
    let connection;
    try {
      console.log('Starting fetchAndStoreData...');
      
      // Probar conexión a la base de datos
      console.log('Testing database connection...');
      await testConnection();
      console.log('Database connection test successful');
      
      // Obtener datos de la API externa
      console.log('Fetching data from external API...');
      const response = await axios.get('https://moriahmkt.com/iotapp/updated/');
      console.log('External API response:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.sensores || !response.data.parcelas) {
        throw new Error('Invalid data format received from API');
      }

      connection = await pool.getConnection();
      console.log('Database connection established');

      // Procesar sensores generales
      console.log('Processing general sensors...');
      const generalSensors = response.data.sensores;
      console.log('General sensors data:', JSON.stringify(generalSensors, null, 2));
      
      // Guardar en historial_sensores
      console.log('Inserting into historial_sensores...');
      const [result] = await connection.query(
        'INSERT INTO historial_sensores (humedad, temperatura, lluvia, sol) VALUES (?, ?, ?, ?)',
        [generalSensors.humedad, generalSensors.temperatura, generalSensors.lluvia, generalSensors.sol]
      );
      console.log('General sensor data saved to historial_sensores. Result:', result);

      // Procesar parcelas
      console.log('Processing parcels...');
      const parcelas = response.data.parcelas;
      console.log('Number of parcelas received:', parcelas.length);
      console.log('Parcelas data:', JSON.stringify(parcelas, null, 2));
      
      // Obtener IDs de parcelas existentes en la BD
      console.log('Fetching existing parcelas...');
      const [existingParcelas] = await connection.query('SELECT id FROM parcelas');
      console.log('Existing parcelas:', existingParcelas);
      const existingIds = existingParcelas.map(p => p.id);
      const currentIds = parcelas.map(p => p.id);
      
      // Detectar parcelas eliminadas (las que están en la BD pero no en la API)
      const deletedIds = existingIds.filter(id => !currentIds.includes(id));
      console.log('Parcelas eliminadas:', deletedIds);

      // Procesar cada parcela
      for (const parcela of parcelas) {
        const { id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud, sensor } = parcela;
        console.log(`\nProcessing parcela ${id}:`, JSON.stringify(parcela, null, 2));
        
        try {
          if (existingIds.includes(id)) {
            // Si la parcela existe, actualizar
            console.log(`Updating existing parcela ${id}...`);
            const [updateResult] = await connection.query(
              `UPDATE parcelas 
               SET nombre = ?, ubicacion = ?, responsable = ?, tipo_cultivo = ?, 
                   ultimo_riego = ?, latitud = ?, longitud = ?
               WHERE id = ?`,
              [nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud, id]
            );
            console.log(`Parcela ${id} actualizada. Result:`, updateResult);
          } else {
            // Si la parcela no existe, insertarla
            console.log(`Inserting new parcela ${id}...`);
            const [insertResult] = await connection.query(
              `INSERT INTO parcelas (id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud]
            );
            console.log(`Nueva parcela ${id} insertada. Result:`, insertResult);
          }

          // Procesar datos del sensor de la parcela
          if (sensor) {
            console.log(`Processing sensor data for parcela ${id}:`, JSON.stringify(sensor, null, 2));
            const sensorHash = generateHash(sensor);
            console.log('Generated sensor hash:', sensorHash);
            
            const [existingSensor] = await connection.query(
              'SELECT id FROM sensores WHERE hash = ?',
              [sensorHash]
            );
            console.log('Existing sensor check result:', existingSensor);

            if (!existingSensor.length) {
              console.log(`Inserting new sensor data for parcela: ${id}`);
              const [sensorResult] = await connection.query(
                'INSERT INTO sensores (parcela_id, humedad, temperatura, lluvia, sol, hash) VALUES (?, ?, ?, ?, ?, ?)',
                [id, sensor.humedad, sensor.temperatura, sensor.lluvia, sensor.sol, sensorHash]
              );
              console.log(`Sensor data inserted successfully for parcela: ${id}. Result:`, sensorResult);
            } else {
              console.log(`Sensor data already exists for parcela: ${id}`);
            }
          }
        } catch (error) {
          console.error(`Error processing parcela ${id}:`, error);
          throw error;
        }
      }

      // Obtener todas las parcelas actualizadas para la respuesta
      console.log('Fetching final parcelas state...');
      const [updatedParcelas] = await connection.query('SELECT * FROM parcelas');
      console.log('Final parcelas state:', JSON.stringify(updatedParcelas, null, 2));
      
      res.json({
        success: true,
        message: 'Datos actualizados correctamente',
        parcelas: updatedParcelas,
        sensores: generalSensors,
        deletedParcelas: deletedIds
      });

    } catch (error) {
      console.error('Error en fetchAndStoreData:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error al obtener y almacenar datos',
        error: error.message
      });
    } finally {
      if (connection) {
        console.log('Releasing database connection');
        connection.release();
      }
    }
  }

  async storeSensorData(req, res) {
    let connection;
    try {
      console.log('Starting storeSensorData...');
      console.log('Received data:', req.body);
      console.log('User from token:', req.user);

      if (!req.body || !req.body.sensores) {
        throw new Error('Invalid data format');
      }

      if (!req.user || !req.user.id) {
        throw new Error('User ID not found in token');
      }

      connection = await pool.getConnection();

      // Procesar sensores generales
      const generalSensors = req.body.sensores;
      const generalHash = generateHash(generalSensors);
      
      const [existingGeneral] = await connection.query(
        'SELECT id FROM sensores WHERE hash = ?',
        [generalHash]
      );

      if (!existingGeneral.length) {
        console.log('Inserting new general sensor data...');
        await connection.query(
          'INSERT INTO sensores (humedad, temperatura, lluvia, sol, hash) VALUES (?, ?, ?, ?, ?)',
          [generalSensors.humedad, generalSensors.temperatura, generalSensors.lluvia, generalSensors.sol, generalHash]
        );
        console.log('General sensor data inserted successfully');
      }

      // Procesar parcelas si existen
      if (req.body.parcelas && Array.isArray(req.body.parcelas)) {
        console.log('Processing parcels...');
        for (const parcela of req.body.parcelas) {
          console.log(`Processing parcela: ${parcela.nombre}`);
          
          // Verificar si la parcela existe
          const [existingParcela] = await connection.query(
            'SELECT id FROM parcelas WHERE id = ?',
            [parcela.id]
          );

          if (!existingParcela.length) {
            console.log(`Creating new parcela: ${parcela.nombre}`);
            await connection.query(
              'INSERT INTO parcelas (id, nombre, ubicacion, responsable, tipo_cultivo, ultimo_riego, latitud, longitud, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [parcela.id, parcela.nombre, parcela.ubicacion, parcela.responsable, parcela.tipo_cultivo, parcela.ultimo_riego, parcela.latitud, parcela.longitud, req.user.id]
            );
            console.log(`Parcela ${parcela.nombre} created successfully`);
          }

          // Procesar datos del sensor de la parcela
          if (parcela.sensor) {
            const sensorHash = generateHash(parcela.sensor);
            const [existingSensor] = await connection.query(
              'SELECT id FROM sensores WHERE hash = ?',
              [sensorHash]
            );

            if (!existingSensor.length) {
              console.log(`Inserting new sensor data for parcela: ${parcela.nombre}`);
              await connection.query(
                'INSERT INTO sensores (humedad, temperatura, lluvia, sol, hash, parcela_id) VALUES (?, ?, ?, ?, ?, ?)',
                [parcela.sensor.humedad, parcela.sensor.temperatura, parcela.sensor.lluvia, parcela.sensor.sol, sensorHash, parcela.id]
              );
              console.log(`Sensor data inserted successfully for parcela: ${parcela.nombre}`);
            }
          }
        }
      }

      console.log('All data processed successfully');
      res.json({
        success: true,
        message: 'Datos almacenados correctamente'
      });
    } catch (error) {
      console.error('Error in storeSensorData:', error);
      res.status(500).json({
        success: false,
        message: 'Error al almacenar datos',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  }

  async getGeneralHistory(req, res) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Primero obtener los datos actuales de la API
      let currentData = null;
      try {
        const response = await axios.get('https://moriahmkt.com/iotapp/updated/');
        if (response.data && response.data.sensores) {
          currentData = response.data.sensores;
        }
      } catch (apiError) {
        console.log('Error al obtener datos de la API:', apiError.message);
      }
      
      // Obtener los últimos 20 valores del historial
      const [historial] = await connection.query(
        `SELECT * FROM historial_sensores 
         ORDER BY created_at DESC
         LIMIT 20`
      );

      // Invertir el orden para que sea ascendente
      historial.reverse();

      res.json({
        success: true,
        currentData,
        historial
      });
    } catch (error) {
      console.error('Error en getGeneralHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  }

  async getParcelaHistory(req, res) {
    let connection;
    try {
      const { parcelaId } = req.params;
      connection = await pool.getConnection();
      
      // Obtener el historial de sensores de la parcela
      const [history] = await connection.query(
        `SELECT * FROM sensores 
         WHERE parcela_id = ? 
         ORDER BY created_at DESC`,
        [parcelaId]
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error in getParcelaHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  }

  async getParcelasEliminadas(req, res) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Obtener datos actuales de la API
      const response = await axios.get('https://moriahmkt.com/iotapp/updated/');
      const currentParcelas = response.data.parcelas || [];
      const currentIds = currentParcelas.map(p => p.id);
      
      // Obtener todas las parcelas de la BD
      const [dbParcelas] = await connection.query('SELECT * FROM parcelas');
      
      // Filtrar las parcelas que están en la BD pero no en la API
      const parcelasEliminadas = dbParcelas.filter(p => !currentIds.includes(p.id));
      
      res.json({
        success: true,
        data: parcelasEliminadas,
        message: parcelasEliminadas.length > 0 
          ? 'Histórico de parcelas eliminadas obtenido correctamente'
          : 'No hay parcelas eliminadas'
      });
    } catch (error) {
      console.error('Error al obtener parcelas eliminadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener histórico de parcelas eliminadas',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  }

  async getParcelasAPI(req, res) {
    try {
      console.log('Fetching data from external API...');
      
      // Llamada a la API externa
      const response = await axios.get('https://moriahmkt.com/iotapp/updated/');
      console.log('External API response:', JSON.stringify(response.data, null, 2));
      
      // Verificar que los datos de parcelas existan
      if (!response.data || !response.data.parcelas) {
        throw new Error('No parcelas data found in the API response');
      }

      const parcelas = response.data.parcelas;

      res.json({
        success: true,
        message: 'Datos de parcelas obtenidos correctamente',
        parcelas: parcelas
      });

    } catch (error) {
      console.error('Error en getParcelasAPI:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos de parcelas de la API',
        error: error.message
      });
    }
  }

  async getParcelas(req, res) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      // últimos datos de los sensores
      const [parcelas] = await connection.query(
        `SELECT p.*, s.humedad, s.temperatura, s.lluvia, s.sol
          FROM parcelas p
          LEFT JOIN sensores s ON p.id = s.parcela_id
          WHERE s.id IN (
            SELECT MAX(id)
            FROM sensores
            GROUP BY parcela_id
          )`
      );
      
      res.json({
        success: true,
        parcelas
      });
    } catch (error) {
      console.error('Error en getParcelas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener parcelas',
        error: error.message
      });
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = new SensorController();