const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { enviarMensaje, obtenerMensajesReporte, misMensajes } = require('../controllers/messageController');

router.post('/', auth, enviarMensaje);
router.get('/mis', auth, misMensajes);
router.get('/reporte/:reporteId', auth, obtenerMensajesReporte);

module.exports = router;
