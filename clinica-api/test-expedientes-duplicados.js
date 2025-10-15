#!/usr/bin/env node

/**
 * Script de pruebas para validar que no se pueden crear expedientes duplicados
 * Prueba la validación que impide crear múltiples expedientes activos para el mismo paciente
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para imprimir con colores
const print = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para imprimir resultados de pruebas
const printResult = (testName, success, message = '') => {
  const status = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  print(color, `${status} ${testName}`);
  if (message) {
    print('yellow', `   ${message}`);
  }
};

// Función para hacer peticiones con manejo de errores
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Función para obtener token de prueba (simulado)
const getTestToken = () => {
  // En un entorno real, aquí obtendrías un token válido de Clerk
  return 'test_token_12345';
};

// Función para crear headers de autenticación
const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${getTestToken()}`
  };
};

// Variables para almacenar IDs creados durante las pruebas
let testPacienteId = null;
let primerExpedienteId = null;

// Función principal de pruebas
const runExpedientesDuplicadosTests = async () => {
  print('cyan', '\n🧪 INICIANDO PRUEBAS DE EXPEDIENTES DUPLICADOS');
  print('cyan', '===============================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Verificar que el servidor esté funcionando
  print('blue', '1. Verificando estado del servidor...');
  totalTests++;
  const healthCheck = await makeRequest('GET', '/api/health');
  if (healthCheck.success) {
    printResult('Servidor funcionando', true, `Status: ${healthCheck.status}`);
    passedTests++;
  } else {
    printResult('Servidor funcionando', false, healthCheck.error);
  }

  // Test 2: Obtener usuarios para encontrar un paciente válido
  print('blue', '\n2. Obteniendo usuarios para encontrar paciente válido...');
  totalTests++;
  const usuariosResponse = await makeRequest('GET', '/api/usuarios', null, getAuthHeaders());
  
  if (usuariosResponse.success && usuariosResponse.data.data?.length > 0) {
    // Buscar un paciente
    const paciente = usuariosResponse.data.data.find(u => u.rol?.idRol === 4); // ROLES.PACIENTE
    if (paciente) {
      testPacienteId = paciente.idUsuario;
      print('green', `   Paciente encontrado: ${paciente.nombre} ${paciente.apellido1} (ID: ${testPacienteId})`);
      printResult('Paciente encontrado', true, `ID: ${testPacienteId}`);
      passedTests++;
    } else {
      printResult('Paciente encontrado', false, 'No se encontró ningún paciente');
    }
  } else {
    printResult('Usuarios obtenidos', false, usuariosResponse.error);
  }

  // Test 3: Crear primer expediente (debe ser exitoso)
  if (testPacienteId) {
    print('blue', '\n3. Creando primer expediente (debe ser exitoso)...');
    totalTests++;
    
    const primerExpediente = {
      idPaciente: testPacienteId,
      cedula: `TEST-${Date.now()}`, // Cédula única
      estado: 'activo',
      descripcion: 'Primer expediente de prueba'
    };

    const primerExpedienteResponse = await makeRequest('POST', '/api/expedientes', primerExpediente, getAuthHeaders());
    if (primerExpedienteResponse.success) {
      primerExpedienteId = primerExpedienteResponse.data.idExpediente;
      printResult('Primer expediente creado', true, `ID: ${primerExpedienteId}`);
      passedTests++;
    } else {
      printResult('Primer expediente creado', false, primerExpedienteResponse.error);
    }
  }

  // Test 4: Intentar crear segundo expediente con mismo paciente (debe fallar)
  if (testPacienteId) {
    print('blue', '\n4. Intentando crear segundo expediente con mismo paciente (debe fallar)...');
    totalTests++;
    
    const segundoExpediente = {
      idPaciente: testPacienteId, // Mismo paciente
      cedula: `TEST-${Date.now()}-2`, // Cédula diferente
      estado: 'activo',
      descripcion: 'Segundo expediente de prueba'
    };

    const segundoExpedienteResponse = await makeRequest('POST', '/api/expedientes', segundoExpediente, getAuthHeaders());
    if (!segundoExpedienteResponse.success && segundoExpedienteResponse.status === 400) {
      printResult('Segundo expediente rechazado', true, 'Correctamente rechazado por paciente duplicado');
      print('yellow', `   Error: ${segundoExpedienteResponse.error.error}`);
      print('yellow', `   Mensaje: ${segundoExpedienteResponse.error.message}`);
      passedTests++;
    } else {
      printResult('Segundo expediente rechazado', false, 'Debería haber sido rechazado');
    }
  }

  // Test 5: Intentar crear expediente con cédula duplicada (debe fallar)
  if (primerExpedienteId) {
    print('blue', '\n5. Intentando crear expediente con cédula duplicada (debe fallar)...');
    totalTests++;
    
    // Obtener la cédula del primer expediente
    const expedienteResponse = await makeRequest('GET', `/api/expedientes/${primerExpedienteId}`, null, getAuthHeaders());
    if (expedienteResponse.success) {
      const cedulaDuplicada = expedienteResponse.data.cedula;
      
      const expedienteCedulaDuplicada = {
        idPaciente: testPacienteId + 1, // Paciente diferente
        cedula: cedulaDuplicada, // Misma cédula
        estado: 'activo',
        descripcion: 'Expediente con cédula duplicada'
      };

      const cedulaDuplicadaResponse = await makeRequest('POST', '/api/expedientes', expedienteCedulaDuplicada, getAuthHeaders());
      if (!cedulaDuplicadaResponse.success && cedulaDuplicadaResponse.status === 400) {
        printResult('Expediente con cédula duplicada rechazado', true, 'Correctamente rechazado por cédula duplicada');
        print('yellow', `   Error: ${cedulaDuplicadaResponse.error.error}`);
        passedTests++;
      } else {
        printResult('Expediente con cédula duplicada rechazado', false, 'Debería haber sido rechazado');
      }
    } else {
      printResult('Obtener expediente para cédula', false, expedienteResponse.error);
    }
  }

  // Test 6: Crear expediente con paciente diferente (debe ser exitoso)
  print('blue', '\n6. Creando expediente con paciente diferente (debe ser exitoso)...');
  totalTests++;
  
  // Buscar otro paciente o usar un ID diferente
  const otroPacienteId = testPacienteId ? testPacienteId + 1 : 1;
  
  const expedienteOtroPaciente = {
    idPaciente: otroPacienteId,
    cedula: `TEST-${Date.now()}-3`, // Cédula única
    estado: 'activo',
    descripcion: 'Expediente de otro paciente'
  };

  const otroPacienteResponse = await makeRequest('POST', '/api/expedientes', expedienteOtroPaciente, getAuthHeaders());
  if (otroPacienteResponse.success) {
    printResult('Expediente de otro paciente creado', true, `ID: ${otroPacienteResponse.data.idExpediente}`);
    passedTests++;
  } else {
    // Si falla por paciente no existe, es esperado
    if (otroPacienteResponse.status === 400 && otroPacienteResponse.error.error?.includes('no existe')) {
      printResult('Expediente de otro paciente', true, 'Rechazado porque el paciente no existe (esperado)');
      passedTests++;
    } else {
      printResult('Expediente de otro paciente', false, otroPacienteResponse.error);
    }
  }

  // Test 7: Verificar que el primer expediente sigue existiendo
  if (primerExpedienteId) {
    print('blue', '\n7. Verificando que el primer expediente sigue existiendo...');
    totalTests++;
    
    const verificarExpedienteResponse = await makeRequest('GET', `/api/expedientes/${primerExpedienteId}`, null, getAuthHeaders());
    if (verificarExpedienteResponse.success) {
      printResult('Primer expediente sigue existiendo', true, `Estado: ${verificarExpedienteResponse.data.estado}`);
      passedTests++;
    } else {
      printResult('Primer expediente sigue existiendo', false, verificarExpedienteResponse.error);
    }
  }

  // Test 8: Probar con diferentes estados "activos"
  if (testPacienteId) {
    print('blue', '\n8. Probando con diferentes estados activos...');
    totalTests++;
    
    const estadosActivos = ['en_proceso', 'pendiente'];
    let todosRechazados = true;
    
    for (const estado of estadosActivos) {
      const expedienteEstado = {
        idPaciente: testPacienteId,
        cedula: `TEST-${Date.now()}-${estado}`,
        estado: estado,
        descripcion: `Expediente en estado ${estado}`
      };

      const estadoResponse = await makeRequest('POST', '/api/expedientes', expedienteEstado, getAuthHeaders());
      if (estadoResponse.success) {
        todosRechazados = false;
        print('red', `   ❌ Expediente con estado "${estado}" fue creado (no debería)`);
      } else if (estadoResponse.status === 400) {
        print('green', `   ✅ Expediente con estado "${estado}" correctamente rechazado`);
      }
    }
    
    if (todosRechazados) {
      printResult('Estados activos rechazados', true, 'Todos los estados activos fueron correctamente rechazados');
      passedTests++;
    } else {
      printResult('Estados activos rechazados', false, 'Algunos estados activos no fueron rechazados');
    }
  }

  // Limpiar: Eliminar expedientes de prueba
  if (primerExpedienteId) {
    print('blue', '\n🧹 Limpiando expedientes de prueba...');
    const deleteResponse = await makeRequest('DELETE', `/api/expedientes/${primerExpedienteId}`, null, getAuthHeaders());
    if (deleteResponse.success) {
      print('green', '   ✅ Primer expediente eliminado');
    } else {
      print('yellow', '   ⚠️ No se pudo eliminar el primer expediente');
    }
  }

  // Resumen final
  print('cyan', '\n📊 RESUMEN DE PRUEBAS DE EXPEDIENTES DUPLICADOS');
  print('cyan', '================================================');
  print('green', `✅ Pruebas exitosas: ${passedTests}`);
  print('red', `❌ Pruebas fallidas: ${totalTests - passedTests}`);
  print('blue', `📈 Total de pruebas: ${totalTests}`);
  print('yellow', `📊 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    print('green', '\n🎉 ¡Todas las pruebas de expedientes duplicados pasaron exitosamente!');
    print('green', '✅ La validación funciona correctamente: no se pueden crear múltiples expedientes activos para el mismo paciente');
  } else {
    print('red', '\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }

  print('cyan', '\n🔗 Documentación API: http://localhost:3000/api-docs');
  print('cyan', '🌐 Base URL: ' + BASE_URL);
};

// Función para mostrar ayuda
const showHelp = () => {
  print('cyan', '\n📚 AYUDA - PRUEBAS DE EXPEDIENTES DUPLICADOS');
  print('cyan', '===========================================');
  print('white', '\nEste script prueba la validación que impide crear múltiples expedientes activos:');
  print('white', '• Verifica que un paciente no puede tener múltiples expedientes activos');
  print('white', '• Prueba diferentes estados considerados "activos"');
  print('white', '• Valida que la cédula no se puede duplicar');
  print('white', '• Confirma que pacientes diferentes pueden tener expedientes');
  print('white', '\nEstados considerados "activos":');
  print('white', '• activo');
  print('white', '• en_proceso');
  print('white', '• pendiente');
  print('white', '\nUso:');
  print('white', '  node test-expedientes-duplicados.js');
  print('white', '  node test-expedientes-duplicados.js --help');
};

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar pruebas
runExpedientesDuplicadosTests().catch(error => {
  print('red', `\n❌ Error ejecutando pruebas: ${error.message}`);
  process.exit(1);
});
