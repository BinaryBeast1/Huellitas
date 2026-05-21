const Message = require('../models/Message');
const Pet = require('../models/Pet');

const enviarMensaje = async (req, res) => {
    try {
        const { reporteId, texto } = req.body;
        const reporte = await Pet.findById(reporteId);
        if (!reporte || reporte.oculto) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        }
        if (reporte.creador.toString() === req.usuario.id) {
            return res.status(400).json({ mensaje: 'No puedes enviarte mensajes a ti mismo' });
        }

        const mensaje = await Message.create({
            reporte: reporteId,
            de: req.usuario.id,
            para: reporte.creador,
            texto
        });

        const poblado = await Message.findById(mensaje._id)
            .populate('de', 'nombre verificado')
            .populate('para', 'nombre');

        res.status(201).json({ mensaje: 'Mensaje enviado de forma segura', data: poblado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al enviar mensaje' });
    }
};

const obtenerMensajesReporte = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.reporteId);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

        const esDueño = reporte.creador.toString() === req.usuario.id;
        const filtro = esDueño
            ? { reporte: req.params.reporteId, para: req.usuario.id }
            : { reporte: req.params.reporteId, de: req.usuario.id };

        const mensajes = await Message.find(filtro)
            .populate('de', 'nombre verificado')
            .sort({ fecha: 1 });

        if (esDueño) {
            await Message.updateMany(
                { reporte: req.params.reporteId, para: req.usuario.id, leido: false },
                { leido: true }
            );
        }

        res.json(mensajes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener mensajes' });
    }
};

const misMensajes = async (req, res) => {
    try {
        const mensajes = await Message.find({
            $or: [{ de: req.usuario.id }, { para: req.usuario.id }]
        })
            .populate('de', 'nombre')
            .populate('reporte', 'nombre fotoUrl')
            .sort({ fecha: -1 })
            .limit(50);
        res.json(mensajes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

module.exports = { enviarMensaje, obtenerMensajesReporte, misMensajes };
