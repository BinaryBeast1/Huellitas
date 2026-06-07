const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    evento: { type: String, required: true },
    detalle: { type: String },
    fecha: { type: Date, default: Date.now }
}, { _id: false });

const petSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    especie: { type: String, required: true, enum: ['Perro', 'Gato', 'Otro'] },
    raza: { type: String },
    color: { type: String },
    descripcion: { type: String, required: true },
    latitud: { type: Number, required: true },
    longitud: { type: Number, required: true },
    ubicacionNombre: { type: String },
    fechaExtravio: { type: Date, default: Date.now },
    creador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fotoUrl: { type: String },
    estado: { type: String, enum: ['extraviado', 'encontrado'], default: 'extraviado' },
    tipoReporte: { type: String, enum: ['perdida', 'avistamiento'], default: 'perdida' },
    recompensa: { type: Number, min: 0 },
    historial: { type: [historialSchema], default: [] },
    denunciasCount: { type: Number, default: 0 },
    oculto: { type: Boolean, default: false },
    destacado: { type: Boolean, default: false },
    reportePerdida: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        default: null
    }
});

module.exports = mongoose.model('Pet', petSchema);
