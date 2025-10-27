import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();

/**
 * Script para diagnosticar por qué no se actualiza el rol
 */
async function debugRolActualizacion() {
  console.log('🔍 Diagnosticando actualización de roles...\n');

  try {
    // 1. Verificar usuarios existentes y sus roles
    console.log('📊 Usuarios existentes en la BD:');
    const usuarios = await prisma.usuario.findMany({
      include: {
        rol: true
      }
    });

    usuarios.forEach(usuario => {
      console.log(`👤 ${usuario.nombre} ${usuario.apellido1} - Rol: ${usuario.rol?.nombreRol} (ID: ${usuario.idRol}) - ClerkID: ${usuario.clerkId}`);
    });

    console.log('\n📋 Roles disponibles en la BD:');
    const roles = await prisma.rol.findMany();
    roles.forEach(rol => {
      console.log(`🎭 ${rol.nombreRol} (ID: ${rol.idRol})`);
    });

    // 2. Simular obtención de datos de Clerk
    console.log('\n🔍 Simulando datos de Clerk...');
    
    // Crear cliente de Clerk
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Obtener usuarios de Clerk
    const clerkUsers = await clerk.users.getUserList();
    console.log(`📊 Usuarios en Clerk: ${clerkUsers.data.length}`);

    for (const clerkUser of clerkUsers.data) {
      console.log(`\n👤 Usuario Clerk: ${clerkUser.firstName} ${clerkUser.lastName}`);
      console.log(`📧 Email: ${clerkUser.emailAddresses[0]?.emailAddress}`);
      console.log(`🆔 Clerk ID: ${clerkUser.id}`);
      console.log(`📝 Public Metadata:`, JSON.stringify(clerkUser.publicMetadata, null, 2));
      console.log(`🔒 Private Metadata:`, JSON.stringify(clerkUser.privateMetadata, null, 2));
      
      // Buscar usuario en BD
      const usuarioBD = await prisma.usuario.findFirst({
        where: {
          OR: [
            { correoElectronico: clerkUser.emailAddresses[0]?.emailAddress },
            { clerkId: clerkUser.id }
          ]
        },
        include: {
          rol: true
        }
      });

      if (usuarioBD) {
        console.log(`✅ Usuario encontrado en BD: ${usuarioBD.nombre} - Rol actual: ${usuarioBD.rol?.nombreRol}`);
        
        // Simular determinación de rol
        const publicRoles = clerkUser.publicMetadata?.roles || [];
        const privateRoles = clerkUser.privateMetadata?.roles || [];
        const metadataRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role;
        
        console.log(`🎯 Metadatos analizados:`);
        console.log(`   - publicRoles: ${JSON.stringify(publicRoles)}`);
        console.log(`   - privateRoles: ${JSON.stringify(privateRoles)}`);
        console.log(`   - metadataRole: ${metadataRole}`);
        
        // Mapear rol
        const roleMapping = {
          'admin': 1,
          'administrador': 1,
          'fisioterapeuta': 2,
          'medico': 2,
          'doctor': 2,
          'recepcionista': 3,
          'receptionist': 3,
          'paciente': 4,
          'patient': 4,
          'user': 4
        };

        const allRoles = [...publicRoles, ...privateRoles];
        if (metadataRole) {
          allRoles.push(metadataRole);
        }

        let nuevoRolId = 4; // Por defecto paciente
        for (const role of allRoles) {
          const normalizedRole = role?.toLowerCase?.() || role;
          if (roleMapping[normalizedRole]) {
            nuevoRolId = roleMapping[normalizedRole];
            console.log(`🎯 Rol determinado: ${role} -> ID: ${nuevoRolId}`);
            break;
          }
        }

        console.log(`🔄 Comparación de roles:`);
        console.log(`   - Rol actual en BD: ${usuarioBD.rol?.nombreRol} (ID: ${usuarioBD.idRol})`);
        console.log(`   - Rol determinado: ID ${nuevoRolId}`);
        console.log(`   - ¿Necesita actualización?: ${usuarioBD.idRol !== nuevoRolId ? 'SÍ' : 'NO'}`);
      } else {
        console.log(`❌ Usuario NO encontrado en BD`);
      }
    }

  } catch (error) {
    console.error('🚨 Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugRolActualizacion().catch(console.error);
}

export { debugRolActualizacion };
