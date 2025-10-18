#!/usr/bin/env node

/**
 * Script de pruebas para endpoints de diagnósticos
 * Prueba todos los endpoints CRUD de diagnósticos con autenticación Clerk
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

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
  // Para las pruebas, usamos un token simulado
  return 'test_token_12345';
};

// Función para crear headers de autenticación
const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${getTestToken()}`
  };
};

// Variables para almacenar IDs creados durante las pruebas
let createdDiagnosticoId = null;
let testPacienteId = null;
let testDoctorId = null;

// Función principal de pruebas
const runDiagnosticoTests = async () => {
  print('cyan', '\n🧪 INICIANDO PRUEBAS DE DIAGNÓSTICOS');
  print('cyan', '=====================================\n');

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

  // Test 2: Obtener lista de diagnósticos (sin autenticación - debe fallar)
  print('blue', '\n2. Probando acceso sin autenticación...');
  totalTests++;
  const noAuthResponse = await makeRequest('GET', '/api/diagnosticos');
  if (!noAuthResponse.success && noAuthResponse.status === 401) {
    printResult('Acceso sin autenticación rechazado', true, 'Correctamente rechazado');
    passedTests++;
  } else {
    printResult('Acceso sin autenticación rechazado', false, 'Debería haber sido rechazado');
  }

  // Test 3: Obtener lista de diagnósticos (con autenticación)
  print('blue', '\n3. Obteniendo lista de diagnósticos...');
  totalTests++;
  const diagnosticosResponse = await makeRequest('GET', '/api/diagnosticos', null, getAuthHeaders());
  if (diagnosticosResponse.success) {
    printResult('Lista de diagnósticos obtenida', true, `Encontrados: ${diagnosticosResponse.data.data?.length || 0} diagnósticos`);
    passedTests++;
  } else {
    printResult('Lista de diagnósticos obtenida', false, diagnosticosResponse.error);
  }

  // Test 4: Crear un nuevo diagnóstico
  print('blue', '\n4. Creando nuevo diagnóstico...');
  totalTests++;
  
  // Primero necesitamos obtener IDs de paciente y doctor válidos
  const usuariosResponse = await makeRequest('GET', '/api/usuarios', null, getAuthHeaders());
  let pacienteId = 1; // ID por defecto
  let doctorId = 2; // ID por defecto
  
  if (usuariosResponse.success && usuariosResponse.data.data?.length > 0) {
    // Buscar un paciente
    const paciente = usuariosResponse.data.data.find(u => u.rol?.idRol === 4); // ROLES.PACIENTE
    if (paciente) {
      pacienteId = paciente.idUsuario;
      testPacienteId = pacienteId;
    }
    
    // Buscar un doctor/fisioterapeuta
    const doctor = usuariosResponse.data.data.find(u => u.rol?.idRol === 2); // ROLES.FISIOTERAPEUTA
    if (doctor) {
      doctorId = doctor.idUsuario;
      testDoctorId = doctorId;
    }
  }

  const nuevoDiagnostico = {
    idPaciente: pacienteId,
    idDoctor: doctorId,
    diagnostico: 'Dolor lumbar crónico con posible hernia discal. Se recomienda fisioterapia y ejercicios de fortalecimiento del core.',
    idExpediente: null
  };

  const createResponse = await makeRequest('POST', '/api/diagnosticos', nuevoDiagnostico, getAuthHeaders());
  if (createResponse.success) {
    createdDiagnosticoId = createResponse.data.data.idDiagnostico;
    printResult('Diagnóstico creado', true, `ID: ${createdDiagnosticoId}`);
    passedTests++;
  } else {
    printResult('Diagnóstico creado', false, createResponse.error);
  }

  // Test 5: Obtener diagnóstico por ID
  if (createdDiagnosticoId) {
    print('blue', '\n5. Obteniendo diagnóstico por ID...');
    totalTests++;
    const getByIdResponse = await makeRequest('GET', `/api/diagnosticos/${createdDiagnosticoId}`, null, getAuthHeaders());
    if (getByIdResponse.success) {
      printResult('Diagnóstico obtenido por ID', true, `Diagnóstico: ${getByIdResponse.data.data.diagnostico.substring(0, 50)}...`);
      passedTests++;
    } else {
      printResult('Diagnóstico obtenido por ID', false, getByIdResponse.error);
    }
  }

  // Test 6: Actualizar diagnóstico
  if (createdDiagnosticoId) {
    print('blue', '\n6. Actualizando diagnóstico...');
    totalTests++;
    const updateData = {
      diagnostico: 'Dolor lumbar crónico con posible hernia discal. Se recomienda fisioterapia, ejercicios de fortalecimiento del core y seguimiento cada 2 semanas.',
      idDoctor: testDoctorId
    };

    const updateResponse = await makeRequest('PUT', `/api/diagnosticos/${createdDiagnosticoId}`, updateData, getAuthHeaders());
    if (updateResponse.success) {
      printResult('Diagnóstico actualizado', true, 'Actualización exitosa');
      passedTests++;
    } else {
      printResult('Diagnóstico actualizado', false, updateResponse.error);
    }
  }

  // Test 7: Obtener diagnósticos de un paciente específico
  if (testPacienteId) {
    print('blue', '\n7. Obteniendo diagnósticos de paciente específico...');
    totalTests++;
    const pacienteDiagnosticosResponse = await makeRequest('GET', `/api/diagnosticos/paciente/${testPacienteId}`, null, getAuthHeaders());
    if (pacienteDiagnosticosResponse.success) {
      printResult('Diagnósticos de paciente obtenidos', true, `Encontrados: ${pacienteDiagnosticosResponse.data.data?.length || 0} diagnósticos`);
      passedTests++;
    } else {
      printResult('Diagnósticos de paciente obtenidos', false, pacienteDiagnosticosResponse.error);
    }
  }

  // Test 8: Probar validaciones - crear diagnóstico sin datos requeridos
  print('blue', '\n8. Probando validaciones - datos faltantes...');
  totalTests++;
  const invalidData = {
    // Falta idPaciente y diagnostico
    idDoctor: testDoctorId
  };

  const invalidCreateResponse = await makeRequest('POST', '/api/diagnosticos', invalidData, getAuthHeaders());
  if (!invalidCreateResponse.success && invalidCreateResponse.status === 400) {
    printResult('Validación de datos faltantes', true, 'Correctamente rechazado');
    passedTests++;
  } else {
    printResult('Validación de datos faltantes', false, 'Debería haber sido rechazado');
  }

  // Test 9: Probar validaciones - diagnóstico muy corto
  print('blue', '\n9. Probando validaciones - diagnóstico muy corto...');
  totalTests++;
  const shortDiagnostico = {
    idPaciente: testPacienteId,
    diagnostico: 'Corto' // Muy corto, debe fallar
  };

  const shortDiagnosticoResponse = await makeRequest('POST', '/api/diagnosticos', shortDiagnostico, getAuthHeaders());
  if (!shortDiagnosticoResponse.success && shortDiagnosticoResponse.status === 400) {
    printResult('Validación de diagnóstico corto', true, 'Correctamente rechazado');
    passedTests++;
  } else {
    printResult('Validación de diagnóstico corto', false, 'Debería haber sido rechazado');
  }

  // Test 10: Eliminar diagnóstico
  if (createdDiagnosticoId) {
    print('blue', '\n10. Eliminando diagnóstico...');
    totalTests++;
    const deleteResponse = await makeRequest('DELETE', `/api/diagnosticos/${createdDiagnosticoId}`, null, getAuthHeaders());
    if (deleteResponse.success) {
      printResult('Diagnóstico eliminado', true, 'Eliminación exitosa');
      passedTests++;
    } else {
      printResult('Diagnóstico eliminado', false, deleteResponse.error);
    }
  }

  // Test 11: Verificar que el diagnóstico fue eliminado
  if (createdDiagnosticoId) {
    print('blue', '\n11. Verificando eliminación...');
    totalTests++;
    const verifyDeleteResponse = await makeRequest('GET', `/api/diagnosticos/${createdDiagnosticoId}`, null, getAuthHeaders());
    if (!verifyDeleteResponse.success && verifyDeleteResponse.status === 404) {
      printResult('Verificación de eliminación', true, 'Diagnóstico no encontrado (correcto)');
      passedTests++;
    } else {
      printResult('Verificación de eliminación', false, 'El diagnóstico aún existe');
    }
  }

  // Resumen final
  print('cyan', '\n📊 RESUMEN DE PRUEBAS');
  print('cyan', '====================');
  print('green', `✅ Pruebas exitosas: ${passedTests}`);
  print('red', `❌ Pruebas fallidas: ${totalTests - passedTests}`);
  print('blue', `📈 Total de pruebas: ${totalTests}`);
  print('yellow', `📊 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    print('green', '\n🎉 ¡Todas las pruebas pasaron exitosamente!');
  } else {
    print('red', '\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }

  print('cyan', '\n🔗 Documentación API: http://localhost:3000/api-docs');
  print('cyan', '🌐 Base URL: ' + BASE_URL);
};

// Función para mostrar ayuda
const showHelp = () => {
  print('cyan', '\n📚 AYUDA - PRUEBAS DE DIAGNÓSTICOS');
  print('cyan', '===================================');
  print('white', '\nEste script prueba todos los endpoints de diagnósticos:');
  print('white', '• GET /api/diagnosticos - Listar diagnósticos');
  print('white', '• GET /api/diagnosticos/:id - Obtener diagnóstico por ID');
  print('white', '• POST /api/diagnosticos - Crear diagnóstico');
  print('white', '• PUT /api/diagnosticos/:id - Actualizar diagnóstico');
  print('white', '• DELETE /api/diagnosticos/:id - Eliminar diagnóstico');
  print('white', '• GET /api/diagnosticos/paciente/:idPaciente - Diagnósticos de paciente');
  print('white', '\nVariables de entorno requeridas:');
  print('white', '• API_URL (opcional, por defecto: http://localhost:3000)');
  print('white', '• CLERK_SECRET_KEY (para autenticación real)');
  print('white', '\nUso:');
  print('white', '  node test-diagnosticos-swagger.js');
  print('white', '  node test-diagnosticos-swagger.js --help');
};

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Ejecutar pruebas
runDiagnosticoTests().catch(error => {
  print('red', `\n❌ Error ejecutando pruebas: ${error.message}`);
  process.exit(1);
});
