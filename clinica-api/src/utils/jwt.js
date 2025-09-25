import jwt from 'jsonwebtoken';
import config from '../config/env.js';
const { jwtSecret, jwtExpiresIn } = config;

// Función para generar token JWT
const generateToken = (payload) => {
	return jwt.sign(payload, jwtSecret, {
		expiresIn: jwtExpiresIn
	});
};

// Función para verificar token JWT
const verifyToken = (token) => {
	return jwt.verify(token, jwtSecret);
};

// Función para generar payload del token
const generateTokenPayload = (usuario) => {
	return {
		idUsuario: usuario.idUsuario,
		correoElectronico: usuario.correoElectronico,
		nombre: usuario.nombre,
		apellido1: usuario.apellido1,
		rol: {
			idRol: usuario.rol?.idRol || null,
			nombreRol: usuario.rol?.nombreRol || null
		}
	};
};

export {
	generateToken,
	verifyToken,
	generateTokenPayload
};

