#!/usr/bin/env node

/**
 * Script para inicializar los roles básicos en la base de datos
 * Este script debe ejecutarse antes de usar la aplicación
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Roles básicos del sistema
const basicRoles = [
  { idRol: 1, nombreRol: 'Administrador', descripcion: 'Administrador del sistema' },
  { idRol: 2, nombreRol: 'Fisioterapeuta', descripcion: 'Médico fisioterapeuta' },
  { idRol: 3, nombreRol: 'Recepcionista', descripcion: 'Recepcionista de la clínica' },
  { idRol: 4, nombreRol: 'Paciente', descripcion: 'Paciente de la clínica' }
];

async function initializeRoles() {
  try {
    console.log('🚀 Inicializando roles básicos...\n');
    
    // Verificar si ya existen roles
    const existingRoles = await prisma.rol.findMany();
    console.log(`📊 Roles existentes: ${existingRoles.length}`);
    
    if (existingRoles.length > 0) {
      console.log('✅ Los roles ya existen en la base de datos:');
      existingRoles.forEach(role => {
        console.log(`   - ID: ${role.idRol}, Nombre: ${role.nombreRol}`);
      });
      return;
    }
    
    // Crear roles básicos
    console.log('🔄 Creando roles básicos...');
    
    for (const role of basicRoles) {
      try {
        await prisma.rol.create({
          data: role
        });
        console.log(`✅ Rol creado: ${role.nombreRol} (ID: ${role.idRol})`);
      } catch (error) {
        console.error(`❌ Error creando rol ${role.nombreRol}:`, error.message);
      }
    }
    
    console.log('\n🎉 ¡Roles inicializados exitosamente!');
    
    // Verificar roles creados
    const finalRoles = await prisma.rol.findMany();
    console.log(`\n📊 Total de roles en la base de datos: ${finalRoles.length}`);
    
  } catch (error) {
    console.error('❌ Error inicializando roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeRoles().catch(console.error);
}

export { initializeRoles, basicRoles };
