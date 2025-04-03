const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/sensors/fetch:
 *   get:
 *     summary: Obtiene y almacena datos de sensores
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos obtenidos y almacenados correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/fetch', authMiddleware, sensorController.fetchAndStoreData);

/**
 * @swagger
 * /api/sensors/store-sensor-data:
 *   post:
 *     summary: Almacena datos de sensores
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensores:
 *                 type: object
 *                 properties:
 *                   humedad:
 *                     type: number
 *                   temperatura:
 *                     type: number
 *                   lluvia:
 *                     type: number
 *                   sol:
 *                     type: number
 *               parcelas:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Datos almacenados correctamente
 *       500:
 *         description: Error del servidor
 */
router.post('/store-sensor-data', authMiddleware, sensorController.storeSensorData);

/**
 * @swagger
 * /api/sensors/history/general:
 *   get:
 *     summary: Obtiene el histórico de datos generales
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico obtenido correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/history/general', authMiddleware, sensorController.getGeneralHistory);

/**
 * @swagger
 * /api/sensors/history/parcela/{parcelaId}:
 *   get:
 *     summary: Obtiene el historial de una parcela
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parcelaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/history/parcela/:parcelaId', authMiddleware, sensorController.getParcelaHistory);

/**
 * @swagger
 * /api/sensors/history/parcelas-eliminadas:
 *   get:
 *     summary: Obtiene el histórico de parcelas eliminadas
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de parcelas eliminadas obtenido correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/history/parcelas-eliminadas', authMiddleware, sensorController.getParcelasEliminadas);

/**
 * @swagger
 * /api/sensors/parcelas:
 *   get:
 *     summary: Obtiene todas las parcelas registradas
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parcelas obtenidas correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/parcelas', authMiddleware, sensorController.getParcelas);

/**
@swagger
 * /api/sensors/parcelasAPI:
 *   get:
 *     summary: Obtiene todas las parcelas de la API
 *     tags: [Sensors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parcelas obtenidas correctamente
 *       500:
 *         description: Error del servidor
 */
router.get('/parcelasAPI', authMiddleware, sensorController.getParcelasAPI);

module.exports = router;