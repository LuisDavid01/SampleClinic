const jwt = require('jsonwebtoken');
const config = require('../config/env');
const prisma = require('../config/database');
const { ROLES, isAdministrador } = require('../constants/roles');
const sessionService = require('../services/sessionService');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('🔍 Auth Header:', authHeader); // Debug log
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('🔍 Token extraído:', token ? 'Presente' : 'Ausente'); // Debug log

  if (!token) {
    console.log('❌ No token provided'); // Debug log
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      message: 'Debe proporcionar un token de autenticación'
    });
  }

  try {
    // Verificar token JWT básico
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Validar sesión en base de datos
    const sessionValidation = await sessionService.validateSession(token);
    
    if (!sessionValidation.valid) {
      return res.status(401).json({
        error: 'Sesión inválida',
        message: sessionValidation.reason
      });
    }

    // Usar información de la sesión validada
    req.user = {
      ...sessionValidation.user,
      rol: {
        idRol: sessionValidation.user.rol?.idRol,
        nombreRol: sessionValidation.user.rol?.nombreRol
      }
    };
    
    // Agregar información de sesión al request
    req.session = {
      id: sessionValidation.session.idSesion,
      lastActivity: sessionValidation.session.ultimaActividad,
      expiresAt: sessionValidation.session.expiraEn
    };

    next();
  } catch (error) {
    console.error('❌ Error al verificar token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token de acceso ha expirado'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'No se pudo verificar el token'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roleIds) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    const userRoleId = req.user.rol?.idRol;
    
    if (!roleIds.includes(userRoleId)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${roleIds.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar si es el mismo usuario o admin
const requireOwnershipOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debe estar autenticado para acceder a este recurso'
    });
  }

  const userId = parseInt(req.params.id || req.params.idUsuario);
  const userIsAdmin = isAdministrador(req.user);
  const isOwner = req.user.idUsuario === userId;

  if (!userIsAdmin && !isOwner) {
    return res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Solo puede acceder a sus propios datos o debe ser administrador'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin
};

