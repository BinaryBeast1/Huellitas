const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    reporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    de: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    para: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true, trim: true },
    leido: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
