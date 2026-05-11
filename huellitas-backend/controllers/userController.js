const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

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

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' },
            (error, token) => {
                if (error) throw error;
                res.status(201).json({
                    mensaje: 'Usuario registrado con exito',
                    token
                });
            }
        );
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

        jwt.sign(
            payload,
            process.env.JWT_SECRET, 
            { expiresIn: '2h' },    
            (error, token) => {
                if (error) throw error;
                res.json({ 
                    mensaje: '🐾 ¡Inicio de sesión exitoso!', 
                    token: token 
                });
            }
        );

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor' });
    }
};

module.exports = { registrarUsuario, loginUsuario };