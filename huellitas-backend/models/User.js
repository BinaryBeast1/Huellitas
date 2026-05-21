const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    telefono: { type: String, trim: true },
    password: { type: String, required: true },
    fechaRegistro: { type: Date, default: Date.now },
    rol: { type: String, enum: ['usuario', 'admin'], default: 'usuario' },
    verificado: { type: Boolean, default: false },
    mostrarContacto: { type: Boolean, default: false },
    alertLat: { type: Number },
    alertLng: { type: Number },
    alertRadiusKm: { type: Number, default: 5 }
});

module.exports = mongoose.model('User', userSchema);
