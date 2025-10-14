#!/usr/bin/env node

/**
 * Pruebas funcionales para endpoints de diagnósticos con autenticación Clerk real
 * Este archivo prueba los endpoints CRUD de diagnósticos usando tokens reales de Clerk
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { getTestTokens } from './utils/test-expedientes-tokens.js';

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

// Función principal de pruebas
const runDiagnosticoTests = async () => {
  print('cyan', '\n🧪 INICIANDO PRUEBAS FUNCIONALES DE DIAGNÓSTICOS');
  print('cyan', '================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Obtener tokens de prueba
  print('blue', '🔑 Obteniendo tokens de autenticación...');
  const tokens = await getTestTokens();
  
  if (!tokens || !tokens.fisioterapeuta || !tokens.paciente) {
    print('red', '❌ No se pudieron obtener tokens de prueba');
    print('yellow', '💡 Asegúrate de que el script populate-essential-data.js se haya ejecutado');
    return;
  }

  print('green', '✅ Tokens obtenidos exitosamente');
  print('blue', `   Fisioterapeuta: ${tokens.fisioterapeuta.substring(0, 20)}...`);
  print('blue', `   Paciente: ${tokens.paciente.substring(0, 20)}...`);

  // Variables para almacenar IDs creados durante las pruebas
  let createdDiagnosticoId = null;
  let testPacienteId = null;
  let testDoctorId = null;

  // Test 1: Verificar que el servidor esté funcionando
  print('blue', '\n1. Verificando estado del servidor...');
  totalTests++;
  const healthCheck = await makeRequest('GET', '/api/health');
  if (healthCheck.success) {
    printResult('Servidor funcionando', true, `Status: ${healthCheck.status}`);
    passedTests++;
  } else {
    printResult('Servidor funcionando', false, healthCheck.error);
  }

  // Test 2: Obtener lista de diagnósticos (con autenticación de fisioterapeuta)
  print('blue', '\n2. Obteniendo lista de diagnósticos (fisioterapeuta)...');
  totalTests++;
  const diagnosticosResponse = await makeRequest('GET', '/api/diagnosticos', null, {
    'Authorization': `Bearer ${tokens.fisioterapeuta}`
  });
  if (diagnosticosResponse.success) {
    printResult('Lista de diagnósticos obtenida', true, `Encontrados: ${diagnosticosResponse.data.data?.length || 0} diagnósticos`);
    passedTests++;
  } else {
    printResult('Lista de diagnósticos obtenida', false, diagnosticosResponse.error);
  }

  // Test 3: Obtener usuarios para encontrar IDs válidos
  print('blue', '\n3. Obteniendo usuarios para IDs válidos...');
  totalTests++;
  const usuariosResponse = await makeRequest('GET', '/api/usuarios', null, {
    'Authorization': `Bearer ${tokens.fisioterapeuta}`
  });
  
  if (usuariosResponse.success && usuariosResponse.data.data?.length > 0) {
    // Buscar un paciente
    const paciente = usuariosResponse.data.data.find(u => u.rol?.idRol === 4); // ROLES.PACIENTE
    if (paciente) {
      testPacienteId = paciente.idUsuario;
      print('green', `   Paciente encontrado: ${paciente.nombre} ${paciente.apellido1} (ID: ${testPacienteId})`);
    }
    
    // Buscar un doctor/fisioterapeuta
    const doctor = usuariosResponse.data.data.find(u => u.rol?.idRol === 2); // ROLES.FISIOTERAPEUTA
    if (doctor) {
      testDoctorId = doctor.idUsuario;
      print('green', `   Doctor encontrado: ${doctor.nombre} ${doctor.apellido1} (ID: ${testDoctorId})`);
    }
    
    printResult('Usuarios obtenidos', true, `Total usuarios: ${usuariosResponse.data.data.length}`);
    passedTests++;
  } else {
    printResult('Usuarios obtenidos', false, usuariosResponse.error);
  }

  // Test 4: Crear un nuevo diagnóstico (como fisioterapeuta)
  if (testPacienteId && testDoctorId) {
    print('blue', '\n4. Creando nuevo diagnóstico (fisioterapeuta)...');
    totalTests++;
    
    const nuevoDiagnostico = {
      idPaciente: testPacienteId,
      idDoctor: testDoctorId,
      diagnostico: 'Dolor lumbar crónico con posible hernia discal L4-L5. Se recomienda fisioterapia, ejercicios de fortalecimiento del core y seguimiento cada 2 semanas. Evitar movimientos de flexión y rotación excesiva.',
      idExpediente: null
    };

    const createResponse = await makeRequest('POST', '/api/diagnosticos', nuevoDiagnostico, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    
    if (createResponse.success) {
      createdDiagnosticoId = createResponse.data.data.idDiagnostico;
      printResult('Diagnóstico creado por fisioterapeuta', true, `ID: ${createdDiagnosticoId}`);
      passedTests++;
    } else {
      printResult('Diagnóstico creado por fisioterapeuta', false, createResponse.error);
    }
  }

  // Test 5: Probar que paciente NO puede crear diagnósticos
  if (testPacienteId) {
    print('blue', '\n5. Probando que paciente NO puede crear diagnósticos...');
    totalTests++;
    
    const diagnosticoPaciente = {
      idPaciente: testPacienteId,
      diagnostico: 'Dolor en la rodilla derecha después de correr. Sensación de rigidez matutina y dolor al subir escaleras. Posible lesión en el menisco.',
      idExpediente: null
    };

    const createPacienteResponse = await makeRequest('POST', '/api/diagnosticos', diagnosticoPaciente, {
      'Authorization': `Bearer ${tokens.paciente}`
    });
    
    if (!createPacienteResponse.success && createPacienteResponse.status === 403) {
      printResult('Paciente correctamente rechazado', true, 'Acceso denegado como esperado');
      passedTests++;
    } else {
      printResult('Paciente correctamente rechazado', false, 'Debería haber sido rechazado');
    }
  }

  // Test 6: Obtener diagnóstico por ID
  if (createdDiagnosticoId) {
    print('blue', '\n6. Obteniendo diagnóstico por ID...');
    totalTests++;
    const getByIdResponse = await makeRequest('GET', `/api/diagnosticos/${createdDiagnosticoId}`, null, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    if (getByIdResponse.success) {
      printResult('Diagnóstico obtenido por ID', true, `Diagnóstico: ${getByIdResponse.data.data.diagnostico.substring(0, 50)}...`);
      passedTests++;
    } else {
      printResult('Diagnóstico obtenido por ID', false, getByIdResponse.error);
    }
  }

  // Test 7: Actualizar diagnóstico
  if (createdDiagnosticoId) {
    print('blue', '\n7. Actualizando diagnóstico...');
    totalTests++;
    const updateData = {
      diagnostico: 'Dolor lumbar crónico con posible hernia discal L4-L5. Se recomienda fisioterapia, ejercicios de fortalecimiento del core y seguimiento cada 2 semanas. Evitar movimientos de flexión y rotación excesiva. Se agregó recomendación de uso de faja lumbar durante actividades pesadas.',
      idDoctor: testDoctorId
    };

    const updateResponse = await makeRequest('PUT', `/api/diagnosticos/${createdDiagnosticoId}`, updateData, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    if (updateResponse.success) {
      printResult('Diagnóstico actualizado', true, 'Actualización exitosa');
      passedTests++;
    } else {
      printResult('Diagnóstico actualizado', false, updateResponse.error);
    }
  }

  // Test 8: Obtener diagnósticos de un paciente específico
  if (testPacienteId) {
    print('blue', '\n8. Obteniendo diagnósticos de paciente específico...');
    totalTests++;
    const pacienteDiagnosticosResponse = await makeRequest('GET', `/api/diagnosticos/paciente/${testPacienteId}`, null, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    if (pacienteDiagnosticosResponse.success) {
      printResult('Diagnósticos de paciente obtenidos', true, `Encontrados: ${pacienteDiagnosticosResponse.data.data?.length || 0} diagnósticos`);
      passedTests++;
    } else {
      printResult('Diagnósticos de paciente obtenidos', false, pacienteDiagnosticosResponse.error);
    }
  }

  // Test 9: Probar acceso con rol incorrecto (recepcionista y paciente)
  print('blue', '\n9. Probando acceso con roles incorrectos...');
  totalTests++;
  
  // Probar con recepcionista
  const recepcionistaResponse = await makeRequest('GET', '/api/diagnosticos', null, {
    'Authorization': `Bearer ${tokens.recepcionista || 'invalid_token'}`
  });
  
  // Probar con paciente
  const pacienteResponse = await makeRequest('GET', '/api/diagnosticos', null, {
    'Authorization': `Bearer ${tokens.paciente}`
  });
  
  if ((!recepcionistaResponse.success && recepcionistaResponse.status === 403) && 
      (!pacienteResponse.success && pacienteResponse.status === 403)) {
    printResult('Acceso con roles incorrectos rechazado', true, 'Recepcionista y paciente correctamente rechazados');
    passedTests++;
  } else {
    printResult('Acceso con roles incorrectos rechazado', false, 'Deberían haber sido rechazados');
  }

  // Test 10: Probar validaciones - crear diagnóstico sin datos requeridos
  print('blue', '\n10. Probando validaciones - datos faltantes...');
  totalTests++;
  const invalidData = {
    // Falta idPaciente y diagnostico
    idDoctor: testDoctorId
  };

  const invalidCreateResponse = await makeRequest('POST', '/api/diagnosticos', invalidData, {
    'Authorization': `Bearer ${tokens.fisioterapeuta}`
  });
  if (!invalidCreateResponse.success && invalidCreateResponse.status === 400) {
    printResult('Validación de datos faltantes', true, 'Correctamente rechazado');
    passedTests++;
  } else {
    printResult('Validación de datos faltantes', false, 'Debería haber sido rechazado');
  }

  // Test 11: Probar validaciones - diagnóstico muy corto
  print('blue', '\n11. Probando validaciones - diagnóstico muy corto...');
  totalTests++;
  const shortDiagnostico = {
    idPaciente: testPacienteId,
    diagnostico: 'Corto' // Muy corto, debe fallar
  };

  const shortDiagnosticoResponse = await makeRequest('POST', '/api/diagnosticos', shortDiagnostico, {
    'Authorization': `Bearer ${tokens.fisioterapeuta}`
  });
  if (!shortDiagnosticoResponse.success && shortDiagnosticoResponse.status === 400) {
    printResult('Validación de diagnóstico corto', true, 'Correctamente rechazado');
    passedTests++;
  } else {
    printResult('Validación de diagnóstico corto', false, 'Debería haber sido rechazado');
  }

  // Test 12: Eliminar diagnóstico
  if (createdDiagnosticoId) {
    print('blue', '\n12. Eliminando diagnóstico...');
    totalTests++;
    const deleteResponse = await makeRequest('DELETE', `/api/diagnosticos/${createdDiagnosticoId}`, null, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    if (deleteResponse.success) {
      printResult('Diagnóstico eliminado', true, 'Eliminación exitosa');
      passedTests++;
    } else {
      printResult('Diagnóstico eliminado', false, deleteResponse.error);
    }
  }

  // Test 13: Verificar que el diagnóstico fue eliminado
  if (createdDiagnosticoId) {
    print('blue', '\n13. Verificando eliminación...');
    totalTests++;
    const verifyDeleteResponse = await makeRequest('GET', `/api/diagnosticos/${createdDiagnosticoId}`, null, {
      'Authorization': `Bearer ${tokens.fisioterapeuta}`
    });
    if (!verifyDeleteResponse.success && verifyDeleteResponse.status === 404) {
      printResult('Verificación de eliminación', true, 'Diagnóstico no encontrado (correcto)');
      passedTests++;
    } else {
      printResult('Verificación de eliminación', false, 'El diagnóstico aún existe');
    }
  }

  // Resumen final
  print('cyan', '\n📊 RESUMEN DE PRUEBAS FUNCIONALES');
  print('cyan', '==================================');
  print('green', `✅ Pruebas exitosas: ${passedTests}`);
  print('red', `❌ Pruebas fallidas: ${totalTests - passedTests}`);
  print('blue', `📈 Total de pruebas: ${totalTests}`);
  print('yellow', `📊 Porcentaje de éxito: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    print('green', '\n🎉 ¡Todas las pruebas funcionales pasaron exitosamente!');
  } else {
    print('red', '\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }

  print('cyan', '\n🔗 Documentación API: http://localhost:3000/api-docs');
  print('cyan', '🌐 Base URL: ' + BASE_URL);
};

// Ejecutar pruebas
runDiagnosticoTests().catch(error => {
  print('red', `\n❌ Error ejecutando pruebas: ${error.message}`);
  process.exit(1);
});
