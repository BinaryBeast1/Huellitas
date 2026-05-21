const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, actualizarPerfil, loginDemo } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User'); 

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/demo', loginDemo);


router.get('/perfil', auth, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.put('/perfil', auth, actualizarPerfil);

module.exports = router;