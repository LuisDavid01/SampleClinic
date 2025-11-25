import prisma from '../config/database.js';
import { createClerkClient } from '@clerk/backend';

/**
 * Inicializa los roles básicos si no existen
 */
async function initializeRoles() {
  try {
    const rolesCount = await prisma.rol.count();
    
    if (rolesCount === 0) {
      
      const basicRoles = [
        { idRol: 1, nombreRol: 'Administrador', descripcion: 'Administrador del sistema' },
        { idRol: 2, nombreRol: 'Fisioterapeuta', descripcion: 'Médico fisioterapeuta' },
        { idRol: 3, nombreRol: 'Recepcionista', descripcion: 'Recepcionista de la clínica' },
        { idRol: 4, nombreRol: 'Paciente', descripcion: 'Paciente de la clínica' }
      ];
      
      for (const role of basicRoles) {
        await prisma.rol.create({
          data: role
        });
      }
    }
  } catch (error) {
    console.error('Error inicializando roles:', error);
    throw error;
  }
}

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
      metadata: clerkUser.publicMetadata || {},
      publicMetadata: clerkUser.publicMetadata || {},
      privateMetadata: clerkUser.privateMetadata || {}
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
    // Inicializar roles si no existen
    await initializeRoles();
    
    // Obtener datos completos del usuario desde Clerk
    const fullClerkUser = await getClerkUserData(clerkUser.id);
    
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
    

    if (usuario) {
      // Actualizar usuario existente
      
      // Determinar nuevo rol basado en metadatos de Clerk
      const nuevoRolId = await determineUserRole(fullClerkUser);
      
      // Validar que el rol existe en la base de datos
      const rolExiste = await prisma.rol.findUnique({
        where: { idRol: nuevoRolId }
      });
      
      if (!rolExiste) {
        console.error(`❌ El rol con ID ${nuevoRolId} no existe en la base de datos`);
        // Mantener el rol actual si el nuevo no es válido
      }
      
      // Forzar la actualización de apellidos y rol
      const updateData = {
        nombre: fullClerkUser.firstName || usuario.nombre,
        apellido1: fullClerkUser.apellido1 || '',
        apellido2: fullClerkUser.apellido2 || '',
        correoElectronico: fullClerkUser.email,
        clerkId: fullClerkUser.id,
        ...(rolExiste && { idRol: nuevoRolId }) // Solo actualizar rol si es válido
      };
      
      
      usuario = await prisma.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: updateData,
        include: {
          rol: true
        }
      });
      
    } else {
      // Crear nuevo usuario
      
      // Validar que el email existe
      if (!fullClerkUser.email) {
        throw new Error('Email del usuario de Clerk no encontrado');
      }
      
      // Determinar rol basado en metadatos o email
      let rolId = await determineUserRole(fullClerkUser);
      
      // Validar que el rol existe en la base de datos
      const rolExiste = await prisma.rol.findUnique({
        where: { idRol: rolId }
      });
      
      if (!rolExiste) {
        console.error(`❌ El rol con ID ${rolId} no existe en la base de datos`);
        // Usar rol de paciente (ID 4) como fallback
        const rolPaciente = await prisma.rol.findUnique({
          where: { idRol: 4 }
        });
        
        if (!rolPaciente) {
          throw new Error('No se pudo encontrar un rol válido para el usuario');
        }
        
        rolId = 4;
      }
      
      usuario = await prisma.usuario.upsert({
        where: {
          correoElectronico: fullClerkUser.email
        },
        update: {
          nombre: fullClerkUser.firstName || 'Usuario',
          apellido1: fullClerkUser.apellido1 || 'Clerk',
          apellido2: fullClerkUser.apellido2 || '',
          clerkId: fullClerkUser.id,
          idRol: rolId,
          activo: true
        },
        create: {
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

    // Obtener roles de los metadatos públicos
    const publicRoles = clerkUser.publicMetadata?.roles || [];
    const privateRoles = clerkUser.privateMetadata?.roles || [];
    const metadataRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role;
    
    // Combinar todos los roles posibles
    const allRoles = [...publicRoles, ...privateRoles];
    if (metadataRole) {
      allRoles.push(metadataRole);
    }
    
    
    // Mapear roles de Clerk a roles de la base de datos
    const roleMapping = {
      'admin': 1,                    // Administrador
      'administrador': 1,            // Administrador (español)
      'fisioterapeuta': 2,          // Fisioterapeuta
      'medico': 2,                   // Fisioterapeuta (alias)
      'doctor': 2,                   // Fisioterapeuta (alias)
      'recepcionista': 3,           // Recepcionista
      'receptionist': 3,             // Recepcionista (inglés)
      'paciente': 4,                 // Paciente
      'patient': 4,                  // Paciente (inglés)
      'user': 4                      // Usuario genérico -> Paciente
    };

    // Buscar el primer rol válido en los metadatos
    for (const role of allRoles) {
      const normalizedRole = role?.toLowerCase?.() || role;
      if (roleMapping[normalizedRole]) {
        return roleMapping[normalizedRole];
      }
    }

    // Si no hay roles en metadatos, usar paciente por defecto
    return 4; // paciente por defecto
  } catch (error) {
    console.error('Error determinando rol de usuario:', error);
    return 4; // paciente por defecto en caso de error
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
      
      // Obtener datos completos de Clerk para comparar
      const fullClerkUser = await getClerkUserData(req.user.id);
      
      // Verificar si los apellidos están separados correctamente
      const needsUpdate = !usuario.apellido1 || !usuario.apellido2 || 
                         (usuario.apellido1 === fullClerkUser.lastName && !usuario.apellido2);
      
      if (needsUpdate) {
        usuario = await syncClerkUser(req.user);
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

/**
 * Función para mostrar información sobre cómo configurar roles en Clerk
 */
function showClerkRoleConfiguration() {
  // Función mantenida para compatibilidad, pero sin logs
}

export {
  syncClerkUser,
  determineUserRole,
  getOrCreateClerkUser,
  syncClerkUserMiddleware,
  initializeRoles,
  showClerkRoleConfiguration
};
