const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const { getJwtSecret } = require('./config/jwt');
try {
    getJwtSecret();
} catch (e) {
    console.error('❌', e.message);
    process.exit(1);
}

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Error: El archivo debe ser una imagen válida (jpeg, jpg, png)"));
    }
});

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

const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// ENCIENDE EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});