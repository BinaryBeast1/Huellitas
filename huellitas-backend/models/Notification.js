const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    texto: { type: String, required: true },
    tipo: { type: String, enum: ['info', 'success', 'alert', 'message'], default: 'info' },
    leida: { type: Boolean, default: false },
    referencia: { type: mongoose.Schema.Types.ObjectId },
    referenciaTipo: { type: String, enum: ['pet', 'message'] },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
