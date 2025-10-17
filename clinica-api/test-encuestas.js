#!/usr/bin/env node

/**
 * Script de prueba para endpoints de encuestas
 * Ejecutar con: node test-encuestas.js
 */

// Usar fetch nativo de Node.js (disponible desde Node 18+)

const API_BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'Bearer sk_test_REVOKED'; // Token de prueba

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${colors.bold}🧪 Probando: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para hacer requests
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': TEST_TOKEN,
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Función para probar endpoint de salud
async function testHealth() {
  logTest('Endpoint de salud');
  
  const { response, data, error } = await makeRequest('/health');
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Servidor funcionando correctamente');
    logInfo(`Respuesta: ${JSON.stringify(data, null, 2)}`);
    return true;
  } else {
    logError(`Error del servidor: ${response.status}`);
    return false;
  }
}

// Función para probar obtener encuestas
async function testGetEncuestas() {
  logTest('Obtener todas las encuestas');
  
  const { response, data, error } = await makeRequest('/encuestas');
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Encuestas obtenidas exitosamente');
    logInfo(`Total de encuestas: ${data.data?.pagination?.total || 0}`);
    logInfo(`Promedio de calificación: ${data.data?.estadisticas?.promedio || 0}`);
    return true;
  } else {
    logError(`Error: ${response.status} - ${data.message || 'Error desconocido'}`);
    return false;
  }
}

// Función para probar crear encuesta
async function testCreateEncuesta() {
  logTest('Crear nueva encuesta');
  
  const encuestaData = {
    calificacion: 5,
    comentario: 'Excelente servicio, muy profesional y atento.',
    idUsuario: 1 // Asumiendo que existe un usuario con ID 1
  };
  
  const { response, data, error } = await makeRequest('/encuestas', {
    method: 'POST',
    body: JSON.stringify(encuestaData)
  });
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Encuesta creada exitosamente');
    logInfo(`ID de encuesta: ${data.data?.idEncuesta}`);
    logInfo(`Calificación: ${data.data?.calificacion}`);
    logInfo(`Comentario: ${data.data?.comentario}`);
    return data.data?.idEncuesta;
  } else {
    logError(`Error: ${response.status} - ${data.message || 'Error desconocido'}`);
    if (data.details) {
      logError(`Detalles: ${JSON.stringify(data.details, null, 2)}`);
    }
    return false;
  }
}

// Función para probar obtener encuesta por ID
async function testGetEncuestaById(encuestaId) {
  if (!encuestaId) {
    logInfo('Saltando prueba de obtener encuesta por ID (no hay ID disponible)');
    return true;
  }
  
  logTest(`Obtener encuesta por ID: ${encuestaId}`);
  
  const { response, data, error } = await makeRequest(`/encuestas/${encuestaId}`);
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Encuesta obtenida exitosamente');
    logInfo(`Calificación: ${data.data?.calificacion}`);
    logInfo(`Comentario: ${data.data?.comentario}`);
    logInfo(`Usuario: ${data.data?.usuario?.nombre} ${data.data?.usuario?.apellido1}`);
    return true;
  } else {
    logError(`Error: ${response.status} - ${data.message || 'Error desconocido'}`);
    return false;
  }
}

// Función para probar estadísticas de encuestas
async function testGetEstadisticas() {
  logTest('Obtener estadísticas de encuestas');
  
  const { response, data, error } = await makeRequest('/encuestas/estadisticas');
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Estadísticas obtenidas exitosamente');
    logInfo(`Promedio: ${data.data?.estadisticas?.promedio || 0}`);
    logInfo(`Total: ${data.data?.estadisticas?.total || 0}`);
    logInfo(`Mínima: ${data.data?.estadisticas?.minima || 0}`);
    logInfo(`Máxima: ${data.data?.estadisticas?.maxima || 0}`);
    return true;
  } else {
    logError(`Error: ${response.status} - ${data.message || 'Error desconocido'}`);
    return false;
  }
}

// Función para probar obtener encuestas por usuario
async function testGetEncuestasByUsuario() {
  logTest('Obtener encuestas por usuario');
  
  const { response, data, error } = await makeRequest('/encuestas/usuario/1');
  
  if (error) {
    logError(`Error de conexión: ${error}`);
    return false;
  }
  
  if (response.ok) {
    logSuccess('Encuestas del usuario obtenidas exitosamente');
    logInfo(`Total de encuestas del usuario: ${data.data?.pagination?.total || 0}`);
    return true;
  } else {
    logError(`Error: ${response.status} - ${data.message || 'Error desconocido'}`);
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  log(`${colors.bold}🚀 Iniciando pruebas de endpoints de encuestas${colors.reset}`);
  log(`${colors.yellow}⚠️  Asegúrate de que el servidor esté ejecutándose en http://localhost:3001${colors.reset}`);
  
  let passedTests = 0;
  let totalTests = 0;
  let createdEncuestaId = null;
  
  // Test 1: Salud del servidor
  totalTests++;
  if (await testHealth()) {
    passedTests++;
  }
  
  // Test 2: Obtener encuestas
  totalTests++;
  if (await testGetEncuestas()) {
    passedTests++;
  }
  
  // Test 3: Crear encuesta
  totalTests++;
  const encuestaId = await testCreateEncuesta();
  if (encuestaId) {
    passedTests++;
    createdEncuestaId = encuestaId;
  }
  
  // Test 4: Obtener encuesta por ID
  totalTests++;
  if (await testGetEncuestaById(createdEncuestaId)) {
    passedTests++;
  }
  
  // Test 5: Estadísticas
  totalTests++;
  if (await testGetEstadisticas()) {
    passedTests++;
  }
  
  // Test 6: Encuestas por usuario
  totalTests++;
  if (await testGetEncuestasByUsuario()) {
    passedTests++;
  }
  
  // Resumen final
  log(`\n${colors.bold}📊 Resumen de pruebas:${colors.reset}`);
  log(`${colors.green}✅ Pruebas exitosas: ${passedTests}/${totalTests}${colors.reset}`);
  
  if (passedTests === totalTests) {
    log(`${colors.green}🎉 ¡Todas las pruebas pasaron exitosamente!${colors.reset}`);
  } else {
    log(`${colors.red}⚠️  Algunas pruebas fallaron. Revisa los errores arriba.${colors.reset}`);
  }
  
  log(`\n${colors.blue}📚 Documentación API disponible en: http://localhost:3001/api-docs${colors.reset}`);
}

// Ejecutar pruebas
runTests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  process.exit(1);
});
