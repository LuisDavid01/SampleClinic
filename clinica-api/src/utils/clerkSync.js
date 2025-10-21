import prisma from '../config/database.js';
import { createClerkClient } from '@clerk/backend';

/**
 * Inicializa los roles básicos si no existen
 */
async function initializeRoles() {
  try {
    const rolesCount = await prisma.rol.count();
    
    if (rolesCount === 0) {
      console.log('🔄 Inicializando roles básicos...');
      
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
        console.log(`✅ Rol creado: ${role.nombreRol}`);
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
        
        console.log('🔄 Usando rol de paciente como fallback');
        rolId = 4;
      }
      
      console.log(`🎯 Creando usuario con rol ID: ${rolId}`);
      
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
    console.log('🔍 Analizando metadatos de Clerk para determinar rol:', {
      metadata: clerkUser.metadata,
      publicMetadata: clerkUser.publicMetadata,
      privateMetadata: clerkUser.privateMetadata
    });

    // Obtener roles de los metadatos públicos
    const publicRoles = clerkUser.publicMetadata?.roles || [];
    const privateRoles = clerkUser.privateMetadata?.roles || [];
    const metadataRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role;
    
    // Combinar todos los roles posibles
    const allRoles = [...publicRoles, ...privateRoles];
    if (metadataRole) {
      allRoles.push(metadataRole);
    }
    
    console.log('🎯 Roles encontrados en metadatos:', {
      publicRoles,
      privateRoles,
      metadataRole,
      allRoles
    });
    
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
        console.log(`🎯 Rol encontrado en metadatos: ${role} -> ID: ${roleMapping[normalizedRole]}`);
        return roleMapping[normalizedRole];
      }
    }

    // Si no hay roles en metadatos, usar paciente por defecto
    console.log('⚠️ No se encontraron roles en los metadatos de Clerk, usando paciente por defecto');
    console.log('💡 Para configurar roles, ve al Dashboard de Clerk → Users → Metadata y agrega:');
    console.log('   {"role": "admin"} o {"roles": ["fisioterapeuta"]}');
    return 4; // paciente por defecto
  } catch (error) {
    console.error('Error determinando rol de usuario:', error);
    console.log('🎯 Rol por defecto en caso de error (paciente): 4');
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
      console.log('🔍 Usuario sincronizado:', dbUser);
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
  console.log(`
🔧 CONFIGURACIÓN DE ROLES EN CLERK
=====================================

Para que los roles funcionen correctamente, debes configurar los metadatos del usuario en Clerk:

1. En el Dashboard de Clerk, ve a "Users" → Selecciona un usuario
2. En la sección "Metadata", agrega uno de estos campos:

   OPCIÓN 1 - Campo 'role' (recomendado):
   {
     "role": "admin"           // o "fisioterapeuta", "recepcionista", "paciente"
   }

   OPCIÓN 2 - Campo 'roles' (array):
   {
     "roles": ["admin"]         // o ["fisioterapeuta"], ["recepcionista"], ["paciente"]
   }

3. Roles válidos:
   - "admin" o "administrador" → Administrador (ID: 1)
   - "fisioterapeuta", "medico", "doctor" → Fisioterapeuta (ID: 2)
   - "recepcionista", "receptionist" → Recepcionista (ID: 3)
   - "paciente", "patient", "user" → Paciente (ID: 4)

4. Si no se especifica rol, se asignará automáticamente como "paciente"

📝 NOTA: Los metadatos se pueden configurar tanto en publicMetadata como en privateMetadata
`);
}

export {
  syncClerkUser,
  determineUserRole,
  getOrCreateClerkUser,
  syncClerkUserMiddleware,
  initializeRoles,
  showClerkRoleConfiguration
};
