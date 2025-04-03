const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Verificar si existe el header de autorización
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar si el token tiene el formato correcto (Bearer token)
    const authHeader = req.headers.authorization;
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Autenticación fallida',
      error: error.message 
    });
  }
};