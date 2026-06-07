const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    obtenerNotificaciones,
    marcarTodasLeidas,
    crearNotificacionUsuario
} = require('../controllers/notificationController');

router.get('/', auth, obtenerNotificaciones);
router.patch('/leer-todas', auth, marcarTodasLeidas);
router.post('/', auth, crearNotificacionUsuario);

module.exports = router;
