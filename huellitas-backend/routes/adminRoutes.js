const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const {
    listarReportes, toggleOculto, toggleDestacado,
    listarUsuarios, verificarUsuario, listarDenuncias, resumen
} = require('../controllers/adminController');

router.use(auth, admin);

router.get('/resumen', resumen);
router.get('/reportes', listarReportes);
router.patch('/reportes/:id/oculto', toggleOculto);
router.patch('/reportes/:id/destacado', toggleDestacado);
router.get('/usuarios', listarUsuarios);
router.patch('/usuarios/:id/verificar', verificarUsuario);
router.get('/denuncias', listarDenuncias);

module.exports = router;
