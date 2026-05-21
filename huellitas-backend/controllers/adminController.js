const Pet = require('../models/Pet');
const User = require('../models/User');
const Denuncia = require('../models/Denuncia');

const listarReportes = async (req, res) => {
    try {
        const reportes = await Pet.find()
            .populate('creador', 'nombre email')
            .sort({ fechaExtravio: -1 });
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const toggleOculto = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'No encontrado' });
        reporte.oculto = !reporte.oculto;
        await reporte.save();
        res.json({ mensaje: reporte.oculto ? 'Reporte oculto' : 'Reporte visible', reporte });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const toggleDestacado = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'No encontrado' });
        reporte.destacado = !reporte.destacado;
        await reporte.save();
        res.json({ mensaje: 'Destacado actualizado', reporte });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select('-password').sort({ fechaRegistro: -1 });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const verificarUsuario = async (req, res) => {
    try {
        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { verificado: true },
            { new: true }
        ).select('-password');
        res.json({ mensaje: 'Usuario verificado', usuario });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const listarDenuncias = async (req, res) => {
    try {
        const denuncias = await Denuncia.find()
            .populate('usuario', 'nombre email')
            .populate('reporte', 'nombre')
            .sort({ fecha: -1 });
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

const resumen = async (req, res) => {
    try {
        const [usuarios, reportes, denuncias, encontrados] = await Promise.all([
            User.countDocuments(),
            Pet.countDocuments(),
            Denuncia.countDocuments(),
            Pet.countDocuments({ estado: 'encontrado' })
        ]);
        res.json({ usuarios, reportes, denuncias, encontrados });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
};

module.exports = {
    listarReportes,
    toggleOculto,
    toggleDestacado,
    listarUsuarios,
    verificarUsuario,
    listarDenuncias,
    resumen
};
