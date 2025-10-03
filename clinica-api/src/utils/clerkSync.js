const prisma = require('../config/database');
const { createClerkClient } = require('@clerk/backend');

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
 * Obtiene los datos completos del usuario desde Clerk
 * @param {string} clerkUserId - ID del usuario en Clerk
 * @returns {Promise<Object>} Datos completos del usuario
 */
async function getClerkUserData(clerkUserId) {
  try {
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    
    // Separar el apellido en apellido1 y apellido2
    const { apellido1, apellido2 } = splitLastName(clerkUser.lastName);
    
    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName, // Mantener el apellido completo para referencia
      apellido1: apellido1,
      apellido2: apellido2,
      metadata: clerkUser.publicMetadata || {}
    };
  } catch (error) {
    console.error('Error obteniendo datos de Clerk:', error);
    throw new Error('No se pudieron obtener los datos del usuario de Clerk');
  }
}

/**
 * Sincroniza un usuario de Clerk con la base de datos local
 * @param {Object} clerkUser - Usuario de Clerk
 * @param {string} clerkUser.id - ID del usuario en Clerk
 * @param {string} clerkUser.email - Email del usuario
 * @param {string} clerkUser.firstName - Nombre del usuario
 * @param {string} clerkUser.lastName - Apellido del usuario
 * @param {Object} clerkUser.metadata - Metadatos del usuario
 * @returns {Object} Usuario sincronizado
 */
async function syncClerkUser(clerkUser) {
  try {
    // Obtener datos completos del usuario desde Clerk
    console.log('🔄 Obteniendo datos completos de Clerk para usuario:', clerkUser.id);
    const fullClerkUser = await getClerkUserData(clerkUser.id);
    
    console.log('👤 Datos completos obtenidos:', {
      id: fullClerkUser.id,
      email: fullClerkUser.email,
      firstName: fullClerkUser.firstName,
      lastName: fullClerkUser.lastName,
      apellido1: fullClerkUser.apellido1,
      apellido2: fullClerkUser.apellido2
    });
    
    // Buscar usuario existente por email o por clerk_id
    console.log('🔍 Buscando usuario existente con:', {
      email: fullClerkUser.email,
      clerkId: fullClerkUser.id
    });
    
    let usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correoElectronico: fullClerkUser.email },
          { clerkId: fullClerkUser.id }
        ]
      },
      include: {
        rol: true
      }
    });
    
    console.log('🔍 Usuario encontrado:', usuario ? {
      id: usuario.idUsuario,
      nombre: usuario.nombre,
      apellido1: usuario.apellido1,
      apellido2: usuario.apellido2,
      email: usuario.correoElectronico,
      clerkId: usuario.clerkId
    } : 'No encontrado');

    if (usuario) {
      // Actualizar usuario existente
      console.log('🔄 Actualizando usuario existente:', {
        id: usuario.idUsuario,
        nombreActual: usuario.nombre,
        apellido1Actual: usuario.apellido1,
        apellido2Actual: usuario.apellido2,
        nombreNuevo: fullClerkUser.firstName,
        apellido1Nuevo: fullClerkUser.apellido1,
        apellido2Nuevo: fullClerkUser.apellido2
      });
      
      // Forzar la actualización de apellidos
      const updateData = {
        nombre: fullClerkUser.firstName || usuario.nombre,
        apellido1: fullClerkUser.apellido1 || '',
        apellido2: fullClerkUser.apellido2 || '',
        correoElectronico: fullClerkUser.email,
        clerkId: fullClerkUser.id,
      };
      
      console.log('📝 Datos a actualizar:', updateData);
      
      usuario = await prisma.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: updateData,
        include: {
          rol: true
        }
      });
      
      console.log('✅ Usuario actualizado exitosamente:', {
        id: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido1: usuario.apellido1,
        apellido2: usuario.apellido2,
        email: usuario.correoElectronico,
        clerkId: usuario.clerkId
      });
    } else {
      // Crear nuevo usuario
      console.log('🔄 Creando nuevo usuario de Clerk:', {
        id: fullClerkUser.id,
        email: fullClerkUser.email,
        firstName: fullClerkUser.firstName,
        lastName: fullClerkUser.lastName,
        apellido1: fullClerkUser.apellido1,
        apellido2: fullClerkUser.apellido2
      });
      
      // Validar que el email existe
      if (!fullClerkUser.email) {
        throw new Error('Email del usuario de Clerk no encontrado');
      }
      
      // Determinar rol basado en metadatos o email
      const rolId = await determineUserRole(fullClerkUser);
      
      usuario = await prisma.usuario.create({
        data: {
          nombre: fullClerkUser.firstName || 'Usuario',
          apellido1: fullClerkUser.apellido1 || 'Clerk',
          apellido2: fullClerkUser.apellido2 || '',
          correoElectronico: fullClerkUser.email,
          contrasena: 'clerk_authenticated', // Placeholder para usuarios de Clerk
          clerkId: fullClerkUser.id,
          idRol: rolId,
          activo: true
        },
        include: {
          rol: true
        }
      });
    }

    return usuario;
  } catch (error) {
    console.error('Error sincronizando usuario de Clerk:', error);
    throw error;
  }
}

/**
 * Determina el rol del usuario basado en metadatos de Clerk
 * @param {Object} clerkUser - Usuario de Clerk
 * @returns {number} ID del rol
 */
async function determineUserRole(clerkUser) {
  try {
    // Verificar si hay roles en los metadatos
    const userRoles = clerkUser.metadata?.roles || [];
    
    // Mapear roles de Clerk a roles de la base de datos
    const roleMapping = {
      'admin': 1,      // admin
      'medico': 2,     // medico
      'paciente': 3    // paciente
    };

    // Buscar el primer rol válido
    for (const role of userRoles) {
      if (roleMapping[role]) {
        return roleMapping[role];
      }
    }

    // Si no hay roles específicos, determinar por email o por defecto
    if (clerkUser.email?.includes('@admin.')) {
      return 1; // admin
    } else if (clerkUser.email?.includes('@medico.')) {
      return 2; // medico
    } else {
      return 3; // paciente por defecto
    }
  } catch (error) {
    console.error('Error determinando rol de usuario:', error);
    return 3; // paciente por defecto en caso de error
  }
}

/**
 * Obtiene o crea un usuario basado en la información de Clerk
 * @param {Object} req - Request object con información de Clerk
 * @returns {Object} Usuario de la base de datos
 */
async function getOrCreateClerkUser(req) {
  if (!req.user) {
    throw new Error('Usuario de Clerk no encontrado en el request');
  }

  try {
    // Buscar usuario existente
    let usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correoElectronico: req.user.email },
          { clerkId: req.user.id }
        ]
      },
      include: {
        rol: true
      }
    });

    if (!usuario) {
      // Sincronizar usuario de Clerk
      usuario = await syncClerkUser(req.user);
    } else {
      // Si el usuario existe, verificar si necesita actualización de apellidos
      console.log('🔄 Usuario existente encontrado, verificando si necesita actualización...');
      
      // Obtener datos completos de Clerk para comparar
      const fullClerkUser = await getClerkUserData(req.user.id);
      
      // Verificar si los apellidos están separados correctamente
      const needsUpdate = !usuario.apellido1 || !usuario.apellido2 || 
                         (usuario.apellido1 === fullClerkUser.lastName && !usuario.apellido2);
      
      if (needsUpdate) {
        console.log('🔄 Actualizando apellidos del usuario existente...');
        usuario = await syncClerkUser(req.user);
      } else {
        console.log('✅ Usuario ya tiene apellidos separados correctamente');
      }
    }

    return usuario;
  } catch (error) {
    console.error('Error obteniendo/creando usuario de Clerk:', error);
    throw error;
  }
}

/**
 * Middleware para sincronizar automáticamente el usuario de Clerk
 */
async function syncClerkUserMiddleware(req, res, next) {
  try {
    if (req.user) {
      const dbUser = await getOrCreateClerkUser(req);
      req.dbUser = dbUser; // Agregar usuario de la DB al request
    }
    next();
  } catch (error) {
    console.error('Error en middleware de sincronización:', error);
    next(error);
  }
}

module.exports = {
  syncClerkUser,
  determineUserRole,
  getOrCreateClerkUser,
  syncClerkUserMiddleware
};
