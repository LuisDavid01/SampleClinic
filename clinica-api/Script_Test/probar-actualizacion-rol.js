import { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';
import { syncClerkUser } from '../src/utils/clerkSync.js';

const prisma = new PrismaClient();

/**
 * Script para probar la actualización de roles
 */
async function probarActualizacionRol() {
  console.log('🧪 Probando actualización de roles...\n');

  try {
    // 1. Obtener usuario de Clerk
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Buscar usuario específico (Adrian Morales)
    const clerkUser = await clerk.users.getUser('user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi');
    
    console.log('👤 Usuario de Clerk encontrado:');
    console.log(`   Nombre: ${clerkUser.firstName} ${clerkUser.lastName}`);
    console.log(`   Email: ${clerkUser.emailAddresses[0]?.emailAddress}`);
    console.log(`   Public Metadata:`, JSON.stringify(clerkUser.publicMetadata, null, 2));

    // 2. Verificar estado actual en BD
    console.log('\n📊 Estado actual en BD:');
    const usuarioActual = await prisma.usuario.findFirst({
      where: { clerkId: 'user_30KfM9ZKYFQjNC7TqzVLzfSt8Vi' },
      include: { rol: true }
    });

    if (usuarioActual) {
      console.log(`   Usuario: ${usuarioActual.nombre} ${usuarioActual.apellido1}`);
      console.log(`   Rol actual: ${usuarioActual.rol?.nombreRol} (ID: ${usuarioActual.idRol})`);
    } else {
      console.log('   ❌ Usuario no encontrado en BD');
      return;
    }

    // 3. Simular datos de Clerk para syncClerkUser
    const clerkUserData = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      metadata: clerkUser.publicMetadata || {},
      publicMetadata: clerkUser.publicMetadata || {},
      privateMetadata: clerkUser.privateMetadata || {}
    };

    console.log('\n🔄 Ejecutando sincronización...');
    console.log('📝 Datos a sincronizar:', {
      id: clerkUserData.id,
      email: clerkUserData.email,
      firstName: clerkUserData.firstName,
      lastName: clerkUserData.lastName,
      publicMetadata: clerkUserData.publicMetadata
    });

    // 4. Ejecutar sincronización
    const usuarioSincronizado = await syncClerkUser(clerkUserData);

    console.log('\n✅ Resultado de la sincronización:');
    console.log(`   Usuario: ${usuarioSincronizado.nombre} ${usuarioSincronizado.apellido1}`);
    console.log(`   Rol actualizado: ${usuarioSincronizado.rol?.nombreRol} (ID: ${usuarioSincronizado.idRol})`);
    console.log(`   Email: ${usuarioSincronizado.correoElectronico}`);
    console.log(`   ClerkID: ${usuarioSincronizado.clerkId}`);

    // 5. Verificar cambio
    if (usuarioActual.idRol !== usuarioSincronizado.idRol) {
      console.log('\n🎉 ¡ROL ACTUALIZADO EXITOSAMENTE!');
      console.log(`   Antes: ${usuarioActual.rol?.nombreRol} (ID: ${usuarioActual.idRol})`);
      console.log(`   Después: ${usuarioSincronizado.rol?.nombreRol} (ID: ${usuarioSincronizado.idRol})`);
    } else {
      console.log('\n⚠️ El rol no cambió (puede que ya esté actualizado)');
    }

  } catch (error) {
    console.error('🚨 Error en la prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  probarActualizacionRol().catch(console.error);
}

export { probarActualizacionRol };
