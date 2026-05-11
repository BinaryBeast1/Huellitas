const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Esto permite leer tu archivo .env

const app = express();

const cors = require('cors');           

// MIDDLEWARES
app.use(cors()); 
app.use(express.json()); 

// CONEXIÓN A MONGODB ATLAS
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log('🐾 ¡Conexión exitosa a la base de datos de Huellitas!');
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB:', error.message);
    });

app.get('/', (req, res) => {
    res.send('API de Huellitas: Sistema de búsqueda de mascotas activo 🐶');
});

// Importar rutas 
const userRoutes = require('./routes/userRoutes');

app.use('/api/users', userRoutes);

const petRoutes = require('./routes/petRoutes'); // <-- NUEVO

app.use('/api/pets', petRoutes);


// ENCIENDE EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});