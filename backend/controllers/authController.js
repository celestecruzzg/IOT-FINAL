const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { admin } = require('../config/googleAuth');

const authController = {
  async register(req, res) {
    let connection;
    try {
      const { nombre, apellidos, correo, contraseña, pregunta_seguridad } = req.body;
      
      connection = await pool.getConnection();
      
      // Verificar si el usuario ya existe
      const [existing] = await connection.query(
        'SELECT id FROM usuarios WHERE correo = ?', 
        [correo]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ message: 'El correo ya está registrado' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      
      // Crear usuario
      const [result] = await connection.query(
        'INSERT INTO usuarios (nombre, apellidos, correo, contraseña, pregunta_seguridad) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellidos, correo, hashedPassword, pregunta_seguridad]
      );

      res.status(201).json({ 
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: result.insertId 
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al registrar usuario', 
        error: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  async login(req, res) {
    let connection;
    try {
      const { correo, contraseña, respuesta_seguridad } = req.body;
      
      if (!correo || !contraseña || !respuesta_seguridad) {
        return res.status(400).json({ 
          success: false,
          message: 'Correo, contraseña y respuesta de seguridad son requeridos' 
        });
      }
      
      connection = await pool.getConnection();
      
      // Buscar usuario
      const [users] = await connection.query(
        'SELECT * FROM usuarios WHERE correo = ?',
        [correo]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false,
          message: 'Credenciales inválidas' 
        });
      }

      const user = users[0];
      
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Credenciales inválidas' 
        });
      }

      // Verificar respuesta de seguridad (comparación directa sin hash)
      if (respuesta_seguridad !== user.pregunta_seguridad) {
        return res.status(401).json({ 
          success: false,
          message: 'Respuesta de seguridad incorrecta' 
        });
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          correo: user.correo 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ 
        success: true,
        token, 
        user: { 
          id: user.id, 
          nombre: user.nombre, 
          correo: user.correo,
          apellidos: user.apellidos
        } 
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al iniciar sesión', 
        error: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  // Nuevo endpoint para obtener la pregunta de seguridad
  async getSecurityQuestion(req, res) {
    let connection;
    try {
      const { correo } = req.body;
      
      if (!correo) {
        return res.status(400).json({ 
          success: false,
          message: 'El correo es requerido' 
        });
      }
      
      connection = await pool.getConnection();
      
      // Buscar usuario
      const [users] = await connection.query(
        'SELECT pregunta_seguridad FROM usuarios WHERE correo = ?',
        [correo]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Usuario no encontrado' 
        });
      }

      res.json({ 
        success: true,
        pregunta_seguridad: users[0].pregunta_seguridad 
      });
    } catch (error) {
      console.error('Error al obtener pregunta:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener pregunta de seguridad', 
        error: error.message 
      });
    } finally {
      if (connection) connection.release();
    }
  },

  async loginWithGoogle(req, res) {
    let connection;
    try {
      console.log('Iniciando login con Google...');
      const { token } = req.body;
      
      if (!token) {
        console.log('No se proporcionó token');
        return res.status(400).json({ 
          success: false,
          message: 'Token de Google requerido' 
        });
      }

      console.log('Verificando token con Firebase Admin...');
      
      // Verificar el token con Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Token verificado, payload:', decodedToken);
      
      if (!decodedToken.email) {
        console.log('Token inválido o sin email');
        return res.status(400).json({
          success: false,
          message: 'Token de Google inválido'
        });
      }

      console.log('Conectando a la base de datos...');
      connection = await pool.getConnection();
      
      // Buscar si el usuario ya existe
      const [users] = await connection.query(
        'SELECT * FROM usuarios WHERE correo = ? AND pregunta_seguridad = ?',
        [decodedToken.email, 'Google Auth']
      );

      let user;
      if (users.length === 0) {
        console.log('Usuario no encontrado, creando nuevo usuario...');
        // Si el usuario no existe, crear uno nuevo
        const nombre = decodedToken.given_name || decodedToken.name || decodedToken.email.split('@')[0];
        const apellidos = decodedToken.family_name || '';
        
        console.log('Datos a insertar:', { nombre, apellidos, correo: decodedToken.email });
        
        const [result] = await connection.query(
          'INSERT INTO usuarios (nombre, apellidos, correo, pregunta_seguridad) VALUES (?, ?, ?, ?)',
          [nombre, apellidos, decodedToken.email, 'Google Auth']
        );

        console.log('Resultado de la inserción:', result);

        user = {
          id: result.insertId,
          nombre: nombre,
          apellidos: apellidos,
          correo: decodedToken.email
        };
      } else {
        console.log('Usuario encontrado:', users[0]);
        user = users[0];
        
        // Actualizar nombre y apellidos con la información más reciente de Google
        const nombre = decodedToken.given_name || decodedToken.name || decodedToken.email.split('@')[0];
        const apellidos = decodedToken.family_name || '';
        
        console.log('Datos a actualizar:', { nombre, apellidos, id: user.id });
        
        const [updateResult] = await connection.query(
          'UPDATE usuarios SET nombre = ?, apellidos = ? WHERE id = ?',
          [nombre, apellidos, user.id]
        );
        
        console.log('Resultado de la actualización:', updateResult);
        
        user.nombre = nombre;
        user.apellidos = apellidos;
      }

      // Verificar que los datos se guardaron correctamente
      const [verifyUser] = await connection.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [user.id]
      );
      
      console.log('Usuario verificado después de guardar:', verifyUser[0]);

      // Generar JWT
      const jwtToken = jwt.sign(
        { 
          id: user.id, 
          correo: user.correo 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Login exitoso para usuario:', user);
      res.json({ 
        success: true,
        token: jwtToken, 
        user: { 
          id: user.id, 
          nombre: user.nombre, 
          correo: user.correo,
          apellidos: user.apellidos
        } 
      });
    } catch (error) {
      console.error('Error detallado en login con Google:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        success: false,
        message: 'Error al iniciar sesión con Google', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } finally {
      if (connection) connection.release();
    }
  }
};

module.exports = authController;