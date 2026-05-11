const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ mensaje: 'No hay token, permiso denegado 🚫' });
    }

    try {
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = cifrado.usuario;
        
        next();

    } catch (error) {
        res.status(401).json({ mensaje: 'Token no válido ❌', error: error.message });
        console.log("Error del Guardia:", error.message);
    } 
};



module.exports = auth;