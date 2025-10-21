#!/usr/bin/env node

/**
 * Script para verificar y corregir los roles en la base de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Roles esperados
const expectedRoles = [
  { idRol: 1, nombreRol: 'Administrador', descripcion: 'Administrador del sistema' },
  { idRol: 2, nombreRol: 'Fisioterapeuta', descripcion: 'Médico fisioterapeuta' },
  { idRol: 3, nombreRol: 'Recepcionista', descripcion: 'Recepcionista de la clínica' },
  { idRol: 4, nombreRol: 'Paciente', descripcion: 'Paciente de la clínica' }
];

async function verifyAndFixRoles() {
  try {
    console.log('🔍 Verificando roles en la base de datos...\n');
    
    // Obtener roles existentes
    const existingRoles = await prisma.rol.findMany();
    console.log(`📊 Roles encontrados: ${existingRoles.length}`);
    
    if (existingRoles.length === 0) {
      console.log('❌ No se encontraron roles en la base de datos');
      console.log('🔄 Creando roles básicos...');
      
      for (const role of expectedRoles) {
        await prisma.rol.create({
          data: role
        });
        console.log(`✅ Rol creado: ${role.nombreRol} (ID: ${role.idRol})`);
      }
    } else {
      console.log('📋 Roles existentes:');
      existingRoles.forEach(role => {
        console.log(`   - ID: ${role.idRol}, Nombre: ${role.nombreRol}`);
      });
      
      // Verificar si faltan roles
      const missingRoles = [];
      for (const expectedRole of expectedRoles) {
        const exists = existingRoles.find(role => role.idRol === expectedRole.idRol);
        if (!exists) {
          missingRoles.push(expectedRole);
        }
      }
      
      if (missingRoles.length > 0) {
        console.log(`\n⚠️ Faltan ${missingRoles.length} roles:`);
        for (const missingRole of missingRoles) {
          console.log(`   - ${missingRole.nombreRol} (ID: ${missingRole.idRol})`);
        }
        
        console.log('\n🔄 Creando roles faltantes...');
        for (const missingRole of missingRoles) {
          await prisma.rol.create({
            data: missingRole
          });
          console.log(`✅ Rol creado: ${missingRole.nombreRol} (ID: ${missingRole.idRol})`);
        }
      } else {
        console.log('\n✅ Todos los roles están presentes');
      }
    }
    
    // Verificación final
    const finalRoles = await prisma.rol.findMany();
    console.log(`\n📊 Total de roles en la base de datos: ${finalRoles.length}`);
    
    if (finalRoles.length === 4) {
      console.log('🎉 ¡Base de datos de roles correctamente configurada!');
    } else {
      console.log('⚠️ Aún hay problemas con los roles');
    }
    
  } catch (error) {
    console.error('❌ Error verificando roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyAndFixRoles().catch(console.error);
}

export { verifyAndFixRoles, expectedRoles };
