/**
 * Uso: node scripts/seedDemo.js
 * Crea usuarios y mascotas de demostración para el concurso.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD } = require('../utils/seedDemoData');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const r = await seedDemoData();
  console.log('✅ Demo listo');
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Contraseña: ${DEMO_PASSWORD}`);
  console.log(`   ${r.usuarios} usuarios, ${r.mascotas} mascotas`);
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
