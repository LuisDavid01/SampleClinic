#!/usr/bin/env node

/**
 * Pruebas funcionales de Expedientes usando token real de Clerk
 */

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

const CLERK_TOKEN = process.env.CLERK_TEST_TOKEN || 'test_clerk_token_placeholder';

// Función para hacer peticiones HTTP
const makeRequest = async (method, endpoint, body = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CLERK_TOKEN}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, data: { error: error.message } };
  }
};

// Función para imprimir resultados de prueba
const printTestResult = (testName, passed, details = '') => {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
};

// Datos de prueba
const expedienteTestData = {
  idPaciente: 4,
  cedula: `test${Date.now()}`, // Usar timestamp para evitar duplicados
  estado: 'activo',
  idMedico: 2,
  descripcion: 'Expediente de prueba con token real de Clerk'
};

const expedienteUpdateData = {
  estado: 'en_tratamiento',
  descripcion: 'Expediente actualizado con token real de Clerk'
};

// Pruebas funcionales con token real de Clerk
const runRealClerkTests = async () => {
  console.log('🔐 Iniciando pruebas funcionales con token real de Clerk...\n');
  
  let expedienteId = null;
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Verificar que el servidor esté funcionando
  totalTests++;
  console.log('🔍 Test 1: Verificar servidor');
  const healthCheck = await makeRequest('GET', '/health');
  if (healthCheck.status === 200) {
    printTestResult('Servidor funcionando', true);
    passedTests++;
  } else {
    printTestResult('Servidor funcionando', false, `Status: ${healthCheck.status}`);
  }

  // Test 2: GET /expedientes con token real de Clerk
  totalTests++;
  console.log('\n🔍 Test 2: GET /expedientes con token real de Clerk');
  const getExpedientes = await makeRequest('GET', '/expedientes');
  if (getExpedientes.status === 200) {
    printTestResult('Obtener expedientes con Clerk', true, `Encontrados: ${getExpedientes.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Obtener expedientes con Clerk', false, `Status: ${getExpedientes.status}, Error: ${JSON.stringify(getExpedientes.data)}`);
  }

  // Test 3: POST /expedientes con token real de Clerk
  totalTests++;
  console.log('\n🔍 Test 3: POST /expedientes con token real de Clerk');
  const postExpediente = await makeRequest('POST', '/expedientes', expedienteTestData);
  if (postExpediente.status === 201) {
    expedienteId = postExpediente.data.data?.idExpediente;
    printTestResult('Crear expediente con Clerk', true, `ID: ${expedienteId}`);
    passedTests++;
  } else {
    printTestResult('Crear expediente con Clerk', false, `Status: ${postExpediente.status}, Error: ${JSON.stringify(postExpediente.data)}`);
  }

  // Test 4: GET /expedientes/:id con token real de Clerk
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 4: GET /expedientes/:id con token real de Clerk');
    const getById = await makeRequest('GET', `/expedientes/${expedienteId}`);
    if (getById.status === 200) {
      printTestResult('Obtener expediente por ID con Clerk', true, `Cédula: ${getById.data.data?.cedula}`);
      passedTests++;
    } else {
      printTestResult('Obtener expediente por ID con Clerk', false, `Status: ${getById.status}`);
    }
  }

  // Test 5: PUT /expedientes/:id con token real de Clerk
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 5: PUT /expedientes/:id con token real de Clerk');
    const putExpediente = await makeRequest('PUT', `/expedientes/${expedienteId}`, expedienteUpdateData);
    if (putExpediente.status === 200) {
      printTestResult('Actualizar expediente con Clerk', true, `Estado: ${putExpediente.data.data?.estado}`);
      passedTests++;
    } else {
      printTestResult('Actualizar expediente con Clerk', false, `Status: ${putExpediente.status}`);
    }
  }

  // Test 6: GET /expedientes con filtros
  totalTests++;
  console.log('\n🔍 Test 6: GET /expedientes con filtros');
  const getWithFilters = await makeRequest('GET', '/expedientes?estado=activo&page=1&limit=5');
  if (getWithFilters.status === 200) {
    printTestResult('Filtros funcionan con Clerk', true, `Encontrados: ${getWithFilters.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Filtros funcionan con Clerk', false, `Status: ${getWithFilters.status}`);
  }

  // Test 7: DELETE /expedientes/:id con token real de Clerk
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 7: DELETE /expedientes/:id con token real de Clerk');
    const deleteExpediente = await makeRequest('DELETE', `/expedientes/${expedienteId}`);
    if (deleteExpediente.status === 200) {
      printTestResult('Eliminar expediente con Clerk', true);
      passedTests++;
    } else {
      printTestResult('Eliminar expediente con Clerk', false, `Status: ${deleteExpediente.status}`);
    }
  }

  // Test 8: POST /expedientes con datos inválidos
  totalTests++;
  console.log('\n🔍 Test 8: POST /expedientes con datos inválidos');
  const invalidData = { idPaciente: 4 }; // Faltan campos requeridos
  const postInvalid = await makeRequest('POST', '/expedientes', invalidData);
  if (postInvalid.status === 400) {
    printTestResult('Valida datos requeridos', true);
    passedTests++;
  } else {
    printTestResult('Valida datos requeridos', false, `Status: ${postInvalid.status}`);
  }

  // Resumen final
  console.log('\n📊 Resumen de pruebas con token real de Clerk:');
  console.log(`✅ Pasaron: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallaron: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas con token real de Clerk pasaron exitosamente!');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los detalles arriba.');
  }

  // Mostrar información del token
  console.log('\n🔑 Información del token de Clerk:');
  console.log(`   Token: ${CLERK_TOKEN.substring(0, 50)}...`);
  console.log(`   Longitud: ${CLERK_TOKEN.length} caracteres`);
  console.log(`   Tipo: JWT con RS256`);
};

// Ejecutar pruebas si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runRealClerkTests().catch(console.error);
}

export {
  runRealClerkTests,
  makeRequest,
  CLERK_TOKEN
};
