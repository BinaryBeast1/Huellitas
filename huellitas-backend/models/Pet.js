const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    especie: {
        type: String,
        required: true,
        enum: ['Perro', 'Gato', 'Otro']
    },
    raza: { type: String },
    color: { type: String }, 
    descripcion: { 
        type: String, 
        required: true 
    },

    // Coordenadas para del mapa
    latitud: {
        type: Number,
        required: true
    },
    longitud: {
        type: Number,
        required: true
    },
    ubicacionNombre: { 
        type: String, 
        placeholder: "Ej: Parque Forestal, Santiago" 
    },
    fechaExtravio: {
        type: Date,
        default: Date.now
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;