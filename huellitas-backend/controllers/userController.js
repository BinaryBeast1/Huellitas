const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const JWT_OPTS = { expiresIn: '7d' };

const registrarUsuario = async (req, res) => {
     try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
        }

        let usuario = await User.findOne({ email });
        if (usuario) {
            return res.status(400).json({ mensaje: 'Ese correo ya está registrado' });
        }

        usuario = new User({
            nombre,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(password, salt);
        await usuario.save();

        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        jwt.sign(payload, getJwtSecret(), JWT_OPTS, (error, token) => {
            if (error) throw error;
            res.status(201).json({
                mensaje: 'Usuario registrado con exito',
                token
            });
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

//  INICIO DE SESIÓN 
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        let usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esPasswordCorrecto) {
            return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        const payload = {
            usuario: {
                id: usuario.id
            }
        };

        jwt.sign(payload, getJwtSecret(), JWT_OPTS, (error, token) => {
            if (error) throw error;
            res.json({
                mensaje: 'Inicio de sesión exitoso',
                token
            });
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const {
            nombre, email, telefono, password,
            mostrarContacto, alertLat, alertLng, alertRadiusKm
        } = req.body;
        const usuario = await User.findById(req.usuario.id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        if (nombre) usuario.nombre = nombre;
        if (telefono !== undefined) usuario.telefono = telefono;
        if (mostrarContacto !== undefined) usuario.mostrarContacto = mostrarContacto;
        if (alertLat !== undefined) usuario.alertLat = alertLat;
        if (alertLng !== undefined) usuario.alertLng = alertLng;
        if (alertRadiusKm !== undefined) usuario.alertRadiusKm = alertRadiusKm;

        if (email && email !== usuario.email) {
            const existe = await User.findOne({ email });
            if (existe) {
                return res.status(400).json({ mensaje: 'Ese correo ya está en uso' });
            }
            usuario.email = email;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }

        await usuario.save();
        const usuarioActualizado = await User.findById(usuario.id).select('-password');
        res.json({ mensaje: 'Perfil actualizado', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

const { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD } = require('../utils/seedDemoData');

const loginDemo = async (req, res) => {
    try {
        const allow = process.env.ALLOW_DEMO_LOGIN === 'true' || process.env.NODE_ENV !== 'production';
        if (!allow) {
            return res.status(403).json({ mensaje: 'Modo demo deshabilitado en producción' });
        }

        let usuario = await User.findOne({ email: DEMO_EMAIL });
        if (!usuario) {
            await seedDemoData();
            usuario = await User.findOne({ email: DEMO_EMAIL });
        }
        if (!usuario) {
            return res.status(503).json({ mensaje: 'No se pudo preparar la cuenta demo' });
        }

        const payload = { usuario: { id: usuario.id } };
        jwt.sign(payload, getJwtSecret(), JWT_OPTS, (error, token) => {
            if (error) throw error;
            res.json({
                mensaje: 'Modo demostración',
                token,
                credenciales: { email: DEMO_EMAIL, password: DEMO_PASSWORD }
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar demo' });
    }
};

module.exports = { registrarUsuario, loginUsuario, actualizarPerfil, loginDemo };