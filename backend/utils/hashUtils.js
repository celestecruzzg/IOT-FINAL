const crypto = require('crypto');

function generateHash(data) {
  // Convertir el objeto a string
  const dataString = JSON.stringify(data);
  
  // Crear un hash SHA-256
  const hash = crypto.createHash('sha256');
  hash.update(dataString);
  
  // Obtener el hash en formato hexadecimal
  return hash.digest('hex');
}

module.exports = {
  generateHash
}; 