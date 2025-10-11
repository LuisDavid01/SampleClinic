#!/usr/bin/env node

/**
 * Archivo maestro para ejecutar todas las pruebas de Expedientes
 * Incluye: pruebas funcionales, integración con Clerk, y rendimiento
 */

import { runTests } from './functional/test-expedientes-funcional.js';
import { runClerkTests } from './integration/test-expedientes-clerk.js';
import { runPerformanceTests } from './performance/test-expedientes-performance.js';

// Función para mostrar el menú
const showMenu = () => {
  console.log('🧪 Suite de Pruebas de Expedientes\n');
  console.log('Selecciona el tipo de prueba a ejecutar:');
  console.log('1. Pruebas funcionales básicas');
  console.log('2. Pruebas de integración con Clerk');
  console.log('3. Pruebas de rendimiento');
  console.log('4. Ejecutar todas las pruebas');
  console.log('5. Mostrar tokens para pruebas manuales');
  console.log('6. Salir');
  console.log('');
};

// Función para ejecutar todas las pruebas
const runAllTests = async () => {
  console.log('🚀 Ejecutando todas las pruebas de Expedientes...\n');
  
  const startTime = Date.now();
  
  try {
    // Ejecutar pruebas funcionales
    console.log('='.repeat(60));
    console.log('PRUEBAS FUNCIONALES');
    console.log('='.repeat(60));
    await runTests();
    
    console.log('\n' + '='.repeat(60));
    console.log('PRUEBAS DE INTEGRACIÓN CON CLERK');
    console.log('='.repeat(60));
    await runClerkTests();
    
    console.log('\n' + '='.repeat(60));
    console.log('PRUEBAS DE RENDIMIENTO');
    console.log('='.repeat(60));
    await runPerformanceTests();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`⏱️  Tiempo total de ejecución: ${(totalTime / 1000).toFixed(2)} segundos`);
    console.log('✅ Todas las pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error durante la ejecución de pruebas:', error.message);
  }
};

// Función para mostrar tokens
const showTokens = async () => {
  console.log('🔑 Tokens para pruebas manuales:\n');
  
  // Mostrar tokens JWT
  console.log('--- Tokens JWT ---');
  const { tokens } = await import('./functional/test-expedientes-funcional.js');
  
  Object.keys(tokens).forEach(role => {
    console.log(`${role.toUpperCase()}: ${tokens[role]}`);
  });
  
  console.log('\n--- Tokens Clerk ---');
  const { showClerkTokens } = await import('./integration/test-expedientes-clerk.js');
  showClerkTokens();
};

// Función principal
const main = async () => {
  const args = process.argv.slice(2);
  
  // Si se pasan argumentos, ejecutar directamente
  if (args.length > 0) {
    const command = args[0];
    
    switch (command) {
      case 'funcional':
        console.log('🧪 Ejecutando pruebas funcionales...\n');
        await runTests();
        break;
        
      case 'clerk':
        console.log('🔐 Ejecutando pruebas de Clerk...\n');
        await runClerkTests();
        break;
        
      case 'performance':
        console.log('⚡ Ejecutando pruebas de rendimiento...\n');
        await runPerformanceTests();
        break;
        
      case 'all':
        await runAllTests();
        break;
        
      case 'tokens':
        await showTokens();
        break;
        
      default:
        console.log('❌ Comando no reconocido. Usa: funcional, clerk, performance, all, o tokens');
        process.exit(1);
    }
    
    return;
  }
  
  // Si no hay argumentos, mostrar menú interactivo
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };
  
  let running = true;
  
  while (running) {
    showMenu();
    const choice = await askQuestion('Ingresa tu opción (1-6): ');
    
    switch (choice.trim()) {
      case '1':
        console.log('\n🧪 Ejecutando pruebas funcionales...\n');
        await runTests();
        break;
        
      case '2':
        console.log('\n🔐 Ejecutando pruebas de Clerk...\n');
        await runClerkTests();
        break;
        
      case '3':
        console.log('\n⚡ Ejecutando pruebas de rendimiento...\n');
        await runPerformanceTests();
        break;
        
      case '4':
        await runAllTests();
        break;
        
      case '5':
        await showTokens();
        break;
        
      case '6':
        console.log('\n👋 ¡Hasta luego!');
        running = false;
        break;
        
      default:
        console.log('\n❌ Opción no válida. Por favor, selecciona 1-6.');
    }
    
    if (running) {
      await askQuestion('\nPresiona Enter para continuar...');
      console.log('\n' + '='.repeat(60) + '\n');
    }
  }
  
  rl.close();
};

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  runAllTests,
  showTokens,
  main
};
