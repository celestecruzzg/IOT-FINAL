const express = require("express");
const cors = require("cors");
const sensorsRoutes = require("../routes/sensors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Permitir solicitudes desde el frontend
app.use(express.json()); // Parsear JSON en las solicitudes

// Rutas
app.use("/sensors", sensorsRoutes);

// Puerto
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});