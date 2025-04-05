const express = require("express");
const { getSensorData } = require("../services/influxService");

const router = express.Router();

// Endpoint para obtener datos actuales de los sensores
router.get("/current", async (req, res) => {
  try {
    const data = await getSensorData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;