const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const auth = (req, res, next) => {
    const raw = req.header('x-auth-token');
    const token = raw?.trim?.() || raw;

    if (!token) {
        return res.status(401).json({ mensaje: 'No hay token, inicia sesión de nuevo' });
    }

    try {
        const cifrado = jwt.verify(token, getJwtSecret());
        req.usuario = cifrado.usuario;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: 'Tu sesión expiró, vuelve a iniciar sesión' });
        }
        console.log('Error de autenticación:', error.message);
        res.status(401).json({ mensaje: 'Token no válido, vuelve a iniciar sesión' });
    }
};

module.exports = auth;
