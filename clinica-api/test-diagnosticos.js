#!/usr/bin/env node

/**
 * Script de ejecución para pruebas de diagnósticos
 * Uso: node test-diagnosticos.js [tipo] [opciones]
 * 
 * Tipos disponibles:
 * - swagger: Pruebas básicas con Swagger
 * - funcional: Pruebas funcionales con Clerk
 * - all: Todas las pruebas de diagnósticos
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testTypes = {
  swagger: 'Pruebas básicas con Swagger',
  funcional: 'Pruebas funcionales con Clerk',
  all: 'Todas las pruebas de diagnósticos'
};

const showHelp = () => {
  console.log('🧪 Ejecutor de Pruebas de Diagnósticos - Clínica API\n');
  console.log('Uso: node test-diagnosticos.js [tipo] [opciones]\n');
  console.log('Tipos disponibles:');
  Object.entries(testTypes).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(12)} - ${value}`);
  });
  console.log('\nEjemplos:');
  console.log('  node test-diagnosticos.js swagger    # Pruebas básicas');
  console.log('  node test-diagnosticos.js funcional  # Pruebas con Clerk');
  console.log('  node test-diagnosticos.js all        # Todas las pruebas');
};

const runTest = (type) => {
  let testFile;
  
  switch (type) {
    case 'swagger':
      testFile = join(__dirname, 'test-diagnosticos-swagger.js');
      break;
    case 'funcional':
      testFile = join(__dirname, 'tests', 'functional', 'test-diagnosticos-clerk.js');
      break;
    case 'all':
      console.log('🚀 Ejecutando todas las pruebas de diagnósticos\n');
      
      // Ejecutar pruebas básicas primero
      console.log('📋 Ejecutando pruebas básicas...');
      const swaggerChild = spawn('node', [join(__dirname, 'test-diagnosticos-swagger.js')], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      swaggerChild.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Pruebas básicas completadas');
          
          // Ejecutar pruebas funcionales
          console.log('\n📋 Ejecutando pruebas funcionales...');
          const funcionalChild = spawn('node', [join(__dirname, 'tests', 'functional', 'test-diagnosticos-clerk.js')], {
            stdio: 'inherit',
            cwd: __dirname
          });
          
          funcionalChild.on('close', (funcionalCode) => {
            if (funcionalCode === 0) {
              console.log('\n🎉 Todas las pruebas de diagnósticos completadas exitosamente');
            } else {
              console.log(`\n❌ Pruebas funcionales fallaron con código: ${funcionalCode}`);
              process.exit(funcionalCode);
            }
          });
        } else {
          console.log(`\n❌ Pruebas básicas fallaron con código: ${code}`);
          process.exit(code);
        }
      });
      return;
    default:
      console.error(`❌ Tipo de prueba no válido: ${type}`);
      process.exit(1);
  }
  
  console.log(`🚀 Ejecutando: ${testTypes[type] || 'pruebas'}\n`);
  
  const child = spawn('node', [testFile], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Pruebas completadas exitosamente');
    } else {
      console.log(`\n❌ Pruebas fallaron con código: ${code}`);
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error('❌ Error ejecutando pruebas:', error.message);
    process.exit(1);
  });
};

const main = () => {
  const args = process.argv.slice(2);
  const type = args[0];
  
  if (!type || type === 'help' || type === '-h' || type === '--help') {
    showHelp();
    return;
  }
  
  if (!testTypes[type]) {
    console.error(`❌ Tipo de prueba no válido: ${type}`);
    console.log('\nTipos disponibles:', Object.keys(testTypes).join(', '));
    process.exit(1);
  }
  
  runTest(type);
};

main();
