const Notification = require('../models/Notification');

const crearNotificacion = async (usuarioId, texto, tipo = 'info', extra = {}) => {
    if (!usuarioId) return null;
    return Notification.create({
        usuario: usuarioId,
        texto,
        tipo,
        referencia: extra.referencia,
        referenciaTipo: extra.referenciaTipo
    });
};

module.exports = { crearNotificacion };
