const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK con la clave privada de tu servicio
admin.initializeApp({
  credential: admin.credential.cert(require('../json/clave-firebase.json')),
});

module.exports = { admin }; 