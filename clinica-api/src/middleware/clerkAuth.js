const { verifyToken, createClerkClient } = require('@clerk/backend');

/**
 * Separa el apellido completo en apellido1 y apellido2
 * @param {string} lastName - Apellido completo del usuario
 * @returns {Object} Objeto con apellido1 y apellido2
 */
function splitLastName(lastName) {
  if (!lastName || typeof lastName !== 'string') {
    return { apellido1: '', apellido2: '' };
  }

  const apellidos = lastName.trim().split(/\s+/);
  
  if (apellidos.length === 1) {
    return { apellido1: apellidos[0], apellido2: '' };
  } else if (apellidos.length === 2) {
    return { apellido1: apellidos[0], apellido2: apellidos[1] };
  } else {
    // Si hay más de 2 palabras, la primera es apellido1 y el resto se unen como apellido2
    return { 
      apellido1: apellidos[0], 
      apellido2: apellidos.slice(1).join(' ') 
    };
  }
}

/**
 * Middleware de autenticación con Clerk
 * Valida tokens JWT de Clerk y obtiene datos completos del usuario
 */
const clerkAuth = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autorización requerido',
        message: 'Debe proporcionar un token Bearer válido'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer " del inicio

    console.log('🔍 Token recibido:', token);
    console.log('🔍 Longitud del token:', token.length);
    console.log('🔍 Partes del token:', token.split('.').length);

    // Verificar el token con Clerk
    let payload;
    try {
      console.log('🔍 Verificando token con Clerk...');
      
      payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      });
      
      console.log('✅ Token verificado exitosamente');
      
      if (!payload) {
        return res.status(401).json({
          error: 'Token inválido',
          message: 'El token proporcionado no es válido'
        });
      }
    } catch (clerkError) {
      console.error('❌ Error verificando token con Clerk:', clerkError);
      
      return res.status(401).json({
        error: 'Error en autenticación Clerk',
        message: clerkError.message || 'Error al verificar el token'
      });
    }

    // Obtener datos completos del usuario desde Clerk API
    let userData;
    try {
      console.log('🔄 Obteniendo datos completos del usuario desde Clerk API...');
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY
      });
      const clerkUser = await clerk.users.getUser(payload.sub);
      
      // Separar el apellido en apellido1 y apellido2
      const { apellido1, apellido2 } = splitLastName(clerkUser.lastName);
      
      userData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        apellido1: apellido1,
        apellido2: apellido2,
        metadata: clerkUser.publicMetadata || {},
        sessionId: payload.sid,
        // Información adicional del token
        tokenPayload: {
          sub: payload.sub,
          sid: payload.sid,
          exp: payload.exp,
          iat: payload.iat
        }
      };
      
      console.log('✅ Datos del usuario obtenidos:', {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      
    } catch (clerkApiError) {
      console.error('❌ Error obteniendo datos del usuario desde Clerk API:', clerkApiError);
      
      // Fallback a datos básicos del token si falla la API
      const { apellido1, apellido2 } = splitLastName(payload.family_name || 'No disponible');
      
      userData = {
        id: payload.sub,
        email: payload.email || 'No disponible',
        firstName: payload.given_name || 'No disponible',
        lastName: payload.family_name || 'No disponible',
        apellido1: apellido1,
        apellido2: apellido2,
        metadata: payload.metadata || {},
        sessionId: payload.sid,
        tokenPayload: {
          sub: payload.sub,
          sid: payload.sid,
          exp: payload.exp,
          iat: payload.iat
        }
      };
      
      console.log('⚠️ Usando datos básicos del token como fallback');
    }

    // Agregar información del usuario al request
    req.user = userData;
    req.clerkUserId = userData.id;
    req.clerkSessionId = userData.sessionId;

    next();
  } catch (error) {
    console.error('Error en autenticación Clerk:', error);
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega información del usuario si existe
 */
const optionalClerkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    if (payload) {
      // Intentar obtener datos completos del usuario
      try {
        const clerk = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY
        });
        const clerkUser = await clerk.users.getUser(payload.sub);
        
        const { apellido1, apellido2 } = splitLastName(clerkUser.lastName);
        
        req.user = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          apellido1: apellido1,
          apellido2: apellido2,
          metadata: clerkUser.publicMetadata || {},
          sessionId: payload.sid
        };
      } catch (apiError) {
        // Fallback a datos básicos del token
        const { apellido1, apellido2 } = splitLastName(payload.family_name);
        
        req.user = {
          id: payload.sub,
          email: payload.email,
          firstName: payload.given_name,
          lastName: payload.family_name,
          apellido1: apellido1,
          apellido2: apellido2,
          metadata: payload.metadata || {},
          sessionId: payload.sid
        };
      }
      
      req.clerkUserId = req.user.id;
      req.clerkSessionId = req.user.sessionId;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    console.warn('Error en autenticación opcional Clerk:', error);
    req.user = null;
    next();
  }
};

/**
 * Middleware para verificar roles específicos de Clerk
 * @param {string[]} allowedRoles - Array de roles permitidos
 */
const requireClerkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    const userRoles = req.user.metadata?.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole && allowedRoles.length > 0) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes para acceder a este recurso',
        requiredRoles: allowedRoles,
        userRoles: userRoles
      });
    }

    next();
  };
};

module.exports = {
  clerkAuth,
  optionalClerkAuth,
  requireClerkRole
};
