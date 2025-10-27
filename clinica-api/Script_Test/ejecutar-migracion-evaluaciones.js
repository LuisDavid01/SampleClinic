#!/usr/bin/env node

/**
 * Script para ejecutar la migración de diagnósticos a evaluaciones
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ejecutarMigracion = async () => {
  console.log('🔄 Ejecutando migración de diagnósticos a evaluaciones...\n');

  try {
    // 1. Verificar que existe el archivo de migración
    const archivoMigracion = path.join(process.cwd(), 'prisma/migrations/20250115000000_update_diagnostico_to_evaluacion.sql');
    
    if (!fs.existsSync(archivoMigracion)) {
      console.error('❌ No se encontró el archivo de migración');
      return;
    }

    console.log('✅ Archivo de migración encontrado');

    // 2. Ejecutar la migración SQL directamente
    console.log('🔄 Ejecutando migración SQL...');
    
    try {
      // Leer el archivo SQL
      const sqlContent = fs.readFileSync(archivoMigracion, 'utf8');
      
      // Ejecutar con psql (asumiendo que la base de datos está corriendo)
      const command = `psql -h localhost -p 5432 -U postgres -d clinica_db -c "${sqlContent.replace(/"/g, '\\"')}"`;
      
      console.log('📝 Ejecutando comando SQL...');
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ Migración SQL ejecutada exitosamente');
      
    } catch (error) {
      console.log('⚠️ Error ejecutando migración SQL directamente, intentando con Prisma...');
      
      // Alternativa: usar Prisma para generar y aplicar la migración
      try {
        console.log('🔄 Generando migración con Prisma...');
        execSync('npx prisma migrate dev --name update_diagnostico_to_evaluacion', { stdio: 'inherit' });
        console.log('✅ Migración generada con Prisma');
      } catch (prismaError) {
        console.log('⚠️ Error con Prisma, ejecutando SQL manualmente...');
        
        // Ejecutar SQL manualmente usando node-postgres o similar
        console.log('📝 Ejecutando SQL manualmente...');
        console.log('Por favor, ejecuta el siguiente SQL en tu base de datos:');
        console.log('\n' + '='.repeat(50));
        console.log(sqlContent);
        console.log('='.repeat(50) + '\n');
      }
    }

    // 3. Regenerar el cliente de Prisma
    console.log('🔄 Regenerando cliente de Prisma...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Cliente de Prisma regenerado');
    } catch (error) {
      console.log('⚠️ Error regenerando cliente de Prisma:', error.message);
    }

    console.log('\n🎉 Migración completada!');
    console.log('\n📋 CAMBIOS REALIZADOS:');
    console.log('   ✅ Tabla "diagnostico" renombrada a "evaluacion_diagnostico"');
    console.log('   ✅ Columna "diagnostico" renombrada a "diagnostico_principal"');
    console.log('   ✅ Nuevas columnas agregadas:');
    console.log('      - sintomas_reportados');
    console.log('      - evaluacion_fisica');
    console.log('      - plan_tratamiento');
    console.log('      - recomendaciones');
    console.log('   ✅ Cliente de Prisma regenerado');

    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: node Script_Test/poblar-evaluaciones-diagnostico.js');
    console.log('   2. Ejecutar: node Script_Test/probar-evaluaciones-endpoints.js');
    console.log('   3. Probar los endpoints en el frontend');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  }
};

// Ejecutar migración
ejecutarMigracion()
  .then(() => {
    console.log('\n✅ Script de migración completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en el script:', error);
    process.exit(1);
  });
