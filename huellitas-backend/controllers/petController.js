const Pet = require('../models/Pet');

const agregarMascota = async (req, res) => {
    try {
        const { nombre, especie, raza, color, descripcion, latitud, longitud, ubicacionNombre } = req.body;

        const nuevoReporte = new Pet({
            nombre,
            especie,
            raza,
            color,
            descripcion,
            latitud,
            longitud,
            ubicacionNombre,
            creador: req.usuario.id 
        });

        const reporteGuardado = await nuevoReporte.save();

        res.status(201).json({ 
            mensaje: '📍 Reporte de extravío creado exitosamente', 
            reporte: reporteGuardado 
        });

    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ mensaje: 'Error al procesar el reporte' });
    }
};

const obtenerMascotas = async (req, res) => {
    try {
        // Traemos todos los reportes para dibujarlos en el mapa
        const reportes = await Pet.find().populate('creador', 'nombre email');
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener reportes' });
    }
};
const eliminarMascota = async (req, res) => {
    try {
        let reporte = await Pet.findById(req.params.id);

        if (!reporte) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        }

        if (reporte.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado para eliminar este reporte 🚫' });
        }

        await Pet.findByIdAndDelete(req.params.id);

        res.json({ mensaje: 'Reporte eliminado del mapa exitosamente (¡Esperamos que haya vuelto a casa!) 🏡' });

    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al intentar eliminar' });
    }
};

const actualizarMascota = async (req, res) => {
    try {
        const { nombre, especie, raza, color, descripcion, latitud, longitud, ubicacionNombre } = req.body;

        let reporte = await Pet.findById(req.params.id);

        if (!reporte) {
            return res.status(404).json({ mensaje: 'Reporte no encontrado' });
        }

        if (reporte.creador.toString() !== req.usuario.id) {
            return res.status(401).json({ mensaje: 'No autorizado para editar este reporte 🚫' });
        }

        const nuevosDatos = {
            nombre, especie, raza, color, descripcion, latitud, longitud, ubicacionNombre
        };

        reporte = await Pet.findByIdAndUpdate(req.params.id, nuevosDatos, { new: true });

        res.json({ mensaje: '✏️ Reporte actualizado con éxito', reporte });

    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor al intentar actualizar' });
    }
};

module.exports = { agregarMascota, obtenerMascotas, eliminarMascota, actualizarMascota };