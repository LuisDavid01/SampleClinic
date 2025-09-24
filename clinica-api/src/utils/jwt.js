const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Función para generar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Función para verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
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

module.exports = {
  generateToken,
  verifyToken,
  generateTokenPayload
};

