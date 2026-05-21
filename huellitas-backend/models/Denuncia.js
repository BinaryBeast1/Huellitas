const mongoose = require('mongoose');

const denunciaSchema = new mongoose.Schema({
    reporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    motivo: { type: String, trim: true },
    fecha: { type: Date, default: Date.now }
});

denunciaSchema.index({ reporte: 1, usuario: 1 }, { unique: true });

module.exports = mongoose.model('Denuncia', denunciaSchema);
