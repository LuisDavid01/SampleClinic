import prisma from '../config/database.js';
import { ROLES } from '../constants/roles.js';

/**
 * Middleware para validar permisos específicos de antecedentes clínicos
 */
export const validateAntecedentesPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }
    
    // Obtener información del usuario desde la base de datos
    const usuario = await prisma.usuario.findFirst({
      where: { clerkId: userId },
      include: { rol: true }
    });
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado en la base de datos'
      });
    }
    
    // Verificar que el usuario tenga rol de admin o fisioterapeuta
    if (![ROLES.ADMINISTRADOR, ROLES.FISIOTERAPEUTA].includes(usuario.rol.idRol)) {
      return res.status(403).json({
        success: false,
        error: 'No tiene permisos para acceder a antecedentes clínicos'
      });
    }
    
    // Para fisioterapeutas, verificar que solo puedan acceder a sus pacientes asignados
    if (usuario.rol.idRol === ROLES.FISIOTERAPEUTA) {
      const pacienteId = parseInt(id);
      
      // Verificar si el fisioterapeuta tiene acceso a este paciente
      const tieneAcceso = await verificarAccesoFisioterapeuta(usuario.idUsuario, pacienteId);
      
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permisos para acceder a los antecedentes de este paciente'
        });
      }
    }
    
    // Agregar información del usuario al request
    req.dbUser = usuario;
    next();
    
  } catch (error) {
    console.error('Error validando permisos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Verifica si un fisioterapeuta tiene acceso a un paciente específico
 */
async function verificarAccesoFisioterapeuta(fisioterapeutaId, pacienteId) {
  try {
    // Verificar si el fisioterapeuta tiene expedientes asignados para este paciente
    const expediente = await prisma.expediente.findFirst({
      where: {
        idPaciente: pacienteId,
        idMedico: fisioterapeutaId,
        estado: {
          in: ['activo', 'en_proceso', 'pendiente']
        }
      }
    });
    
    return !!expediente;
  } catch (error) {
    console.error('Error verificando acceso de fisioterapeuta:', error);
    return false;
  }
}

/**
 * Middleware para validar que el paciente existe y es válido
 */
export const validatePaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pacienteId = parseInt(id);
    
    if (isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }
    
    // Verificar que el paciente existe y es realmente un paciente
    const paciente = await prisma.usuario.findUnique({
      where: { idUsuario: pacienteId },
      include: { rol: true }
    });
    
    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }
    
    if (paciente.rol.idRol !== ROLES.PACIENTE) {
      return res.status(400).json({
        success: false,
        error: 'El usuario especificado no es un paciente'
      });
    }
    
    req.paciente = paciente;
    next();
    
  } catch (error) {
    console.error('Error validando paciente:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para validar límites de rate limiting
 */
export const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpiar requests antiguos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }
    
    const userRequests = requests.get(userId);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

/**
 * Middleware para validar integridad de datos
 */
export const validateDataIntegrity = (req, res, next) => {
  try {
    // Validar que los datos no contengan scripts maliciosos
    const body = req.body;
    if (body) {
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\(/i,
        /expression\(/i
      ];
      
      const bodyString = JSON.stringify(body);
      
      for (const pattern of maliciousPatterns) {
        if (pattern.test(bodyString)) {
          return res.status(400).json({
            success: false,
            error: 'Datos contienen contenido no permitido'
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Error validando integridad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para logging de seguridad
 */
export const securityLogging = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    // Log de seguridad para operaciones sensibles
    if (url.includes('/antecedentes') && [200, 201, 400, 403, 404, 500].includes(statusCode)) {
    }
  });
  
  next();
};
