const Notification = require('../models/Notification');

const obtenerNotificaciones = async (req, res) => {
    try {
        const lista = await Notification.find({ usuario: req.usuario.id })
            .sort({ fecha: -1 })
            .limit(50);
        res.json(lista);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
    }
};

const marcarTodasLeidas = async (req, res) => {
    try {
        await Notification.updateMany(
            { usuario: req.usuario.id, leida: false },
            { leida: true }
        );
        res.json({ mensaje: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar notificaciones' });
    }
};

const crearNotificacionUsuario = async (req, res) => {
    try {
        const { texto, tipo } = req.body;
        if (!texto?.trim()) {
            return res.status(400).json({ mensaje: 'Texto requerido' });
        }
        const notif = await Notification.create({
            usuario: req.usuario.id,
            texto: texto.trim(),
            tipo: tipo || 'info'
        });
        res.status(201).json(notif);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear notificación' });
    }
};

module.exports = { obtenerNotificaciones, marcarTodasLeidas, crearNotificacionUsuario };
