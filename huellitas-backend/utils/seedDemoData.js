const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pet = require('../models/Pet');

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@huellitas.cl';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo2026';

const USUARIOS = [
  { nombre: 'Demo Huellitas', email: DEMO_EMAIL, verificado: true, telefono: '912345678', mostrarContacto: true },
  { nombre: 'María Providencia', email: 'maria@huellitas.cl', verificado: true },
  { nombre: 'Carlos Ñuñoa', email: 'carlos@huellitas.cl', verificado: false },
];

const MASCOTAS = (ids) => [
  {
    nombre: 'Coda',
    especie: 'Perro',
    raza: 'Beagle',
    color: 'Café claro',
    descripcion: 'Perrito con collar rojo. Muy amigable.',
    latitud: -33.4489,
    longitud: -70.6693,
    ubicacionNombre: 'Escuela ciudad santo domingo de guzmán',
    creador: ids[DEMO_EMAIL],
    tipoReporte: 'perdida',
    recompensa: 99000,
    estado: 'extraviado',
    destacado: true,
    historial: [{ evento: 'Reporte de pérdida', detalle: 'Publicado en Escuela ciudad santo domingo de guzmán' }],
  },
  {
    nombre: 'Bobby',
    especie: 'Perro',
    raza: 'Cocker',
    color: 'Café',
    descripcion: 'Perrito con collar rojo.',
    latitud: -33.4372,
    longitud: -70.6826,
    ubicacionNombre: 'Estación Central',
    creador: ids['maria@huellitas.cl'],
    tipoReporte: 'perdida',
    recompensa: 50000,
    estado: 'encontrado',
    historial: [
      { evento: 'Reporte de pérdida', detalle: 'Publicado en Estación Central' },
      { evento: 'Mascota encontrada', detalle: 'El dueño confirmó el reencuentro' },
    ],
  },
  {
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    color: 'Crema',
    descripcion: 'Gata asustadiza, collar azul con cascabel.',
    latitud: -33.4255,
    longitud: -70.6100,
    ubicacionNombre: 'Providencia, Av. Providencia',
    creador: ids['carlos@huellitas.cl'],
    tipoReporte: 'perdida',
    recompensa: 30000,
    estado: 'extraviado',
    historial: [{ evento: 'Reporte de pérdida', detalle: 'Publicado en Providencia' }],
  },
  {
    nombre: 'Sin nombre',
    especie: 'Perro',
    raza: 'Mestizo',
    color: 'Negro',
    descripcion: 'Avistamiento: perro mediano vagando cerca del parque.',
    latitud: -33.4410,
    longitud: -70.6550,
    ubicacionNombre: 'Parque Bustamante',
    creador: ids['carlos@huellitas.cl'],
    tipoReporte: 'avistamiento',
    estado: 'extraviado',
    historial: [{ evento: 'Avistamiento registrado', detalle: 'Publicado en Parque Bustamante' }],
  },
  {
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Beagle',
    color: 'Tricolor',
    descripcion: 'Beagle joven, sin collar. Posible avistamiento relacionado con Coda.',
    latitud: -33.4502,
    longitud: -70.6705,
    ubicacionNombre: 'Cerca de Santo Domingo',
    creador: ids['maria@huellitas.cl'],
    tipoReporte: 'avistamiento',
    estado: 'extraviado',
    historial: [{ evento: 'Avistamiento registrado', detalle: 'Publicado cerca de Santo Domingo' }],
  },
  {
    nombre: 'Max',
    especie: 'Perro',
    raza: 'Labrador',
    color: 'Dorado',
    descripcion: 'Labrador adulto, sin collar.',
    latitud: -33.4560,
    longitud: -70.6480,
    ubicacionNombre: 'Ñuñoa, Plaza Ñuñoa',
    creador: ids[DEMO_EMAIL],
    tipoReporte: 'perdida',
    recompensa: 150000,
    estado: 'extraviado',
    historial: [{ evento: 'Reporte de pérdida', detalle: 'Publicado en Plaza Ñuñoa' }],
  },
];

async function seedDemoData() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(DEMO_PASSWORD, salt);
  const ids = {};

  for (const u of USUARIOS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = new User({ ...u, password: hash });
      await user.save();
    } else {
      user.nombre = u.nombre;
      user.verificado = u.verificado;
      if (u.telefono) user.telefono = u.telefono;
      if (u.mostrarContacto != null) user.mostrarContacto = u.mostrarContacto;
      if (u.email === DEMO_EMAIL) user.password = hash;
      await user.save();
    }
    ids[u.email] = user._id;
  }

  await Pet.deleteMany({ creador: { $in: Object.values(ids) } });

  for (const m of MASCOTAS(ids)) {
    await Pet.create(m);
  }

  return { demoEmail: DEMO_EMAIL, demoPassword: DEMO_PASSWORD, usuarios: Object.keys(ids).length, mascotas: MASCOTAS(ids).length };
}

module.exports = { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD };
