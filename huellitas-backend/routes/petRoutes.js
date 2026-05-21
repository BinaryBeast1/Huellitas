const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    agregarMascota, obtenerMascotas, obtenerMascota, obtenerSimilares,
    obtenerMascotasPublicas, obtenerMascotaPublica, obtenerSimilaresPublicos,
    eliminarMascota, actualizarMascota, marcarEncontrado, denunciarReporte,
    obtenerEstadisticas
} = require('../controllers/petController');
const auth = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/stats/public', obtenerEstadisticas);
router.get('/public/mapa', obtenerMascotasPublicas);
router.get('/public/:id/similares', obtenerSimilaresPublicos);
router.get('/public/:id', obtenerMascotaPublica);
router.get('/', auth, obtenerMascotas);
router.get('/:id/similares', auth, obtenerSimilares);
router.get('/:id', auth, obtenerMascota);
router.post('/', auth, upload.single('foto'), agregarMascota);
router.put('/:id', auth, upload.single('foto'), actualizarMascota);
router.patch('/:id/encontrado', auth, marcarEncontrado);
router.post('/:id/denunciar', auth, denunciarReporte);
router.delete('/:id', auth, eliminarMascota);

module.exports = router;
