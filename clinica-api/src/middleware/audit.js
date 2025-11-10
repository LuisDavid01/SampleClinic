import prisma from '../config/database.js';

/**
 * Middleware para registrar logs de auditoría
 * Registra automáticamente todas las acciones realizadas en antecedentes clínicos
 */
export const auditMiddleware = async (req, res, next) => {
  const originalSend = res.send;
  
  // Interceptar la respuesta para registrar la acción
  res.send = function(data) {
    // Solo registrar si la operación fue exitosa
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAuditAction(req, res, data).catch(error => {
        console.error('Error registrando auditoría:', error);
      });
      //console.log('Req recibida:', req);

    }
    
    // Llamar al método original
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Registra una acción de auditoría en la base de datos
 */
async function logAuditAction(req, res, data) {
  try {
    const { method, url, baseUrl, user } = req;
    const { statusCode } = res;
    // Extraer información de la acción
    const action = getActionFromMethod(method);
    const resource = getResourceFromUrl(url, baseUrl);
    const resourceId = getResourceIdFromUrl(url);
    console.log('Recurso auditado:', req);
    // Obtener información del usuario
    const userId = user?.id ? await getUserIdFromClerkId(user.id) : null;
    const userInfo = user ? {
      clerkId: user.id,
      email: user.email,
      nombre: user.firstName,
      apellido: user.lastName
    } : null;
    
    // Crear registro de auditoría
    await prisma.auditoriaAntecedentes.create({
      data: {
        accion: action,
        recurso: resource,
        recursoId: resourceId,
        metodo: method,
        url: url,
        statusCode: statusCode,
        usuarioId: userId,
        usuarioInfo: userInfo,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        detalles: {
          requestBody: sanitizeRequestBody(req.body),
          responseData: sanitizeResponseData(data)
        }
      }
    });
    
    console.log(`🔍 Auditoría registrada: ${action} en ${resource} por usuario ${userId}`);
    
  } catch (error) {
    console.error('Error en auditoría:', error);
    // No lanzar error para no afectar la operación principal
  }
}

/**
 * Obtiene el ID del usuario en la base de datos desde su Clerk ID
 */
async function getUserIdFromClerkId(clerkId) {
  try {
    const usuario = await prisma.usuario.findFirst({
      where: { clerkId },
      select: { idUsuario: true }
    });
    return usuario?.idUsuario || null;
  } catch (error) {
    console.error('Error obteniendo ID de usuario:', error);
    return null;
  }
}

/**
 * Determina la acción basada en el método HTTP
 */
function getActionFromMethod(method) {
  const actions = {
    'GET': 'CONSULTAR',
    'POST': 'CREAR',
    'PUT': 'ACTUALIZAR',
    'DELETE': 'ELIMINAR',
    'PATCH': 'MODIFICAR'
  };
  return actions[method] || 'DESCONOCIDO';
}

/**
 * Extrae el recurso de la URL
 */
function getResourceFromUrl(url, baseURL) {
  if (url.includes('/antecedentes')) {
    return 'ANTECEDENTES_CLINICOS';
  }
  if (baseURL.includes('/usuarios')) {
    return 'LOGS_USUARIOS';
  }
  return 'DESCONOCIDO';
}

/**
 * Extrae el ID del recurso de la URL
 */
function getResourceIdFromUrl(url) {
  const match = url.match(/\/pacientes\/(\d+)\/antecedentes/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Sanitiza el cuerpo de la petición para remover datos sensibles
 */
function sanitizeRequestBody(body) {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remover campos sensibles
  const sensitiveFields = ['contrasena', 'password', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitiza los datos de respuesta para remover información sensible
 */
function sanitizeResponseData(data) {
  if (!data) return null;
  
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const sanitized = { ...parsed };
    
    // Remover campos sensibles de la respuesta
    if (sanitized.data && sanitized.data.medicoRegistro) {
      sanitized.data.medicoRegistro = {
        idUsuario: sanitized.data.medicoRegistro.idUsuario,
        nombre: sanitized.data.medicoRegistro.nombre
        // Remover apellidos y otros datos sensibles
      };
    }
    
    return sanitized;
  } catch (error) {
    return { error: 'No se pudo parsear la respuesta' };
  }
}

/**
 * Obtiene el historial de auditoría para un paciente específico
 */
export const getAuditHistory = async (pacienteId) => {
  try {
    const historial = await prisma.auditoriaAntecedentes.findMany({
      where: {
        recurso: 'ANTECEDENTES_CLINICOS',
        recursoId: pacienteId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Últimos 50 registros
    });
    
    return historial;
  } catch (error) {
    console.error('Error obteniendo historial de auditoría:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de auditoría
 */
export const getAuditStats = async (fechaInicio, fechaFin) => {
  try {
    const whereClause = {
      timestamp: {
        gte: fechaInicio,
        lte: fechaFin
      }
    };
    
    const stats = await prisma.auditoriaAntecedentes.groupBy({
      by: ['accion', 'usuarioId'],
      where: whereClause,
      _count: {
        id: true
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error obteniendo estadísticas de auditoría:', error);
    throw error;
  }
};
