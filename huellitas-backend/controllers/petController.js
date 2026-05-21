const Pet = require('../models/Pet');
const User = require('../models/User');
const Denuncia = require('../models/Denuncia');
const { distanciaKm } = require('../utils/geo');

const agregarHistorial = (pet, evento, detalle) => {
    pet.historial.push({ evento, detalle, fecha: new Date() });
};

const agregarMascota = async (req, res) => {
    try {
        const {
            nombre, especie, raza, color, descripcion,
            latitud, longitud, ubicacionNombre, tipoReporte, recompensa
        } = req.body;

        const esPerdida = (tipoReporte || 'perdida') === 'perdida';
        const nuevaMascota = new Pet({
            nombre,
            especie,
            raza,
            color,
            descripcion,
            latitud,
            longitud,
            ubicacionNombre,
            creador: req.usuario.id,
            fotoUrl: req.file ? `/uploads/${req.file.filename}` : null,
            estado: 'extraviado',
            tipoReporte: tipoReporte || 'perdida',
            recompensa: recompensa ? Number(recompensa) : undefined,
            historial: [{
                evento: esPerdida ? 'Reporte de pérdida' : 'Avistamiento registrado',
                detalle: `Publicado en ${ubicacionNombre || 'mapa'}`
            }]
        });

        const mascotaGuardada = await nuevaMascota.save();
        const reporteCompleto = await Pet.findById(mascotaGuardada._id)
            .populate('creador', 'nombre email telefono verificado mostrarContacto');

        res.status(201).json({
            mensaje: 'Reporte creado exitosamente',
            reporte: reporteCompleto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el reporte' });
    }
};

const obtenerMascotas = async (req, res) => {
    try {
        const { q, ubicacion, estado, tipo } = req.query;
        const filtro = { oculto: false };

        if (q) {
            filtro.$or = [
                { nombre: { $regex: q, $options: 'i' } },
                { raza: { $regex: q, $options: 'i' } }
            ];
        }
        if (ubicacion) filtro.ubicacionNombre = { $regex: ubicacion, $options: 'i' };
        if (estado) filtro.estado = estado;
        if (tipo) filtro.tipoReporte = tipo;

        const reportes = await Pet.find(filtro)
            .populate('creador', 'nombre verificado mostrarContacto')
            .sort({ destacado: -1, fechaExtravio: -1 });

        res.json(reportes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener reportes' });
    }
};

const obtenerMascota = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id)
            .populate('creador', 'nombre email telefono verificado mostrarContacto');
        if (!reporte || reporte.oculto) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        }
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener reporte' });
    }
};

const obtenerSimilares = async (req, res) => {
    try {
        const base = await Pet.findById(req.params.id);
        if (!base) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

        const candidatos = await Pet.find({
            _id: { $ne: base._id },
            oculto: false,
            estado: 'extraviado',
            especie: base.especie
        }).populate('creador', 'nombre verificado');

        const similares = candidatos
            .map(p => {
                let score = 0;
                if (base.raza && p.raza && base.raza.toLowerCase() === p.raza.toLowerCase()) score += 40;
                else if (base.raza && p.raza && p.raza.toLowerCase().includes(base.raza.toLowerCase().slice(0, 3))) score += 20;
                if (base.color && p.color && base.color.toLowerCase() === p.color.toLowerCase()) score += 25;
                if (base.nombre && p.nombre && p.nombre.toLowerCase().includes(base.nombre.toLowerCase().slice(0, 2))) score += 15;
                const km = distanciaKm(base.latitud, base.longitud, p.latitud, p.longitud);
                if (km <= 2) score += 30;
                else if (km <= 5) score += 20;
                else if (km <= 15) score += 10;
                return { reporte: p, score, distanciaKm: Math.round(km * 10) / 10 };
            })
            .filter(x => x.score >= 25)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);

        res.json({ base: base._id, similares });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar similares' });
    }
};

const eliminarMascota = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        const usuario = await User.findById(req.usuario.id);
        if (reporte.creador.toString() !== req.usuario.id && usuario?.rol !== 'admin') {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }
        await Pet.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Reporte eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
};

const actualizarMascota = async (req, res) => {
    try {
        const { nombre, especie, raza, color, descripcion, latitud, longitud, ubicacionNombre, recompensa } = req.body;
        let reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        if (reporte.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }

        const nuevosDatos = { nombre, especie, raza, color, descripcion, latitud, longitud, ubicacionNombre };
        if (recompensa !== undefined) nuevosDatos.recompensa = Number(recompensa) || 0;
        if (req.file) nuevosDatos.fotoUrl = `/uploads/${req.file.filename}`;

        agregarHistorial(reporte, 'Reporte actualizado', 'Datos modificados por el dueño');
        Object.assign(reporte, nuevosDatos);
        await reporte.save();

        const actualizado = await Pet.findById(req.params.id)
            .populate('creador', 'nombre email telefono verificado mostrarContacto');
        res.json({ mensaje: 'Reporte actualizado', reporte: actualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar' });
    }
};

const marcarEncontrado = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        if (reporte.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }
        reporte.estado = 'encontrado';
        agregarHistorial(reporte, 'Mascota encontrada', 'El dueño confirmó el reencuentro');
        await reporte.save();

        const actualizado = await Pet.findById(req.params.id)
            .populate('creador', 'nombre email telefono verificado mostrarContacto');
        res.json({ mensaje: 'Mascota marcada como encontrada', reporte: actualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

const denunciarReporte = async (req, res) => {
    try {
        const { motivo } = req.body;
        const reporte = await Pet.findById(req.params.id);
        if (!reporte) return res.status(404).json({ mensaje: 'Reporte no encontrado' });

        await Denuncia.create({ reporte: reporte._id, usuario: req.usuario.id, motivo });
        reporte.denunciasCount += 1;
        if (reporte.denunciasCount >= 3) {
            reporte.oculto = true;
            agregarHistorial(reporte, 'Moderación', 'Reporte oculto por múltiples denuncias');
        }
        await reporte.save();
        res.json({ mensaje: 'Denuncia registrada. Gracias por ayudar a la comunidad.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ mensaje: 'Ya denunciaste este reporte' });
        }
        res.status(500).json({ mensaje: 'Error al denunciar' });
    }
};

const obtenerMascotasPublicas = async (req, res) => {
    try {
        const reportes = await Pet.find({ oculto: false })
            .populate('creador', 'nombre verificado')
            .sort({ destacado: -1, fechaExtravio: -1 })
            .limit(80);
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener reportes públicos' });
    }
};

const obtenerMascotaPublica = async (req, res) => {
    try {
        const reporte = await Pet.findById(req.params.id)
            .populate('creador', 'nombre verificado');
        if (!reporte || reporte.oculto) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        }
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener reporte' });
    }
};

const obtenerSimilaresPublicos = async (req, res) => {
    req.usuario = { id: 'public' };
    return obtenerSimilares(req, res);
};

const obtenerEstadisticas = async (req, res) => {
    try {
        const [total, encontrados, activos, avistamientos] = await Promise.all([
            Pet.countDocuments({ oculto: false }),
            Pet.countDocuments({ estado: 'encontrado', oculto: false }),
            Pet.countDocuments({ estado: 'extraviado', oculto: false }),
            Pet.countDocuments({ tipoReporte: 'avistamiento', oculto: false })
        ]);
        res.json({ total, encontrados, activos, avistamientos });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

module.exports = {
    agregarMascota,
    obtenerMascotas,
    obtenerMascota,
    obtenerSimilares,
    obtenerMascotasPublicas,
    obtenerMascotaPublica,
    obtenerSimilaresPublicos,
    eliminarMascota,
    actualizarMascota,
    marcarEncontrado,
    denunciarReporte,
    obtenerEstadisticas
};
