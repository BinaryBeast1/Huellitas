/**
 * Uso: node scripts/crearAdmin.js email@ejemplo.com
 * Marca un usuario existente como administrador.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.log('Uso: node scripts/crearAdmin.js tu@email.com');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const u = await User.findOneAndUpdate({ email }, { rol: 'admin' }, { new: true });
  if (u) console.log('✅ Admin asignado a:', u.email);
  else console.log('❌ Usuario no encontrado');
  process.exit(0);
});
