const express = require('express');
const router = express.Router();
const { agregarMascota, obtenerMascotas, eliminarMascota, actualizarMascota } = require('../controllers/petController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, agregarMascota);
router.get('/', obtenerMascotas);
router.delete('/:id', auth, eliminarMascota);

router.put('/:id', auth, actualizarMascota);

module.exports = router;