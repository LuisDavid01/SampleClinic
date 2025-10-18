#!/usr/bin/env node

/**
 * Script de ejecución rápida para todas las pruebas
 * Uso: node run-tests.js [tipo] [opciones]
 * 
 * Tipos disponibles:
 * - all: Todas las pruebas
 * - funcional: Solo pruebas funcionales
 * - integration: Solo pruebas de integración
 * - performance: Solo pruebas de rendimiento
 * - tokens: Mostrar tokens
 * - menu: Menú interactivo
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testTypes = {
  all: 'Todas las pruebas',
  funcional: 'Pruebas funcionales',
  integration: 'Pruebas de integración', 
  performance: 'Pruebas de rendimiento',
  tokens: 'Mostrar tokens',
  menu: 'Menú interactivo'
};

const showHelp = () => {
  console.log('🧪 Ejecutor de Pruebas - Clínica API\n');
  console.log('Uso: node run-tests.js [tipo] [opciones]\n');
  console.log('Tipos disponibles:');
  Object.entries(testTypes).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(12)} - ${value}`);
  });
  console.log('\nEjemplos:');
  console.log('  node run-tests.js all          # Ejecutar todas las pruebas');
  console.log('  node run-tests.js funcional    # Solo pruebas funcionales');
  console.log('  node run-tests.js menu         # Menú interactivo');
  console.log('  node run-tests.js tokens       # Mostrar tokens');
};

const runTest = (type) => {
  const testFile = join(__dirname, 'tests', 'test-expedientes-all.js');
  
  console.log(`🚀 Ejecutando: ${testTypes[type] || 'pruebas'}\n`);
  
  const child = spawn('node', [testFile, type], {
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
