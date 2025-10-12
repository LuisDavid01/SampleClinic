import jwt from 'jsonwebtoken';
import config from './src/config/env.js';
import { ROLES, ROLE_NAMES } from './src/constants/roles.js';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Crear token para pruebas
const createToken = (usuario) => {
  const payload = {
    idUsuario: usuario.idUsuario,
    correoElectronico: usuario.correoElectronico,
    nombre: usuario.nombre,
    apellido1: usuario.apellido1,
    rol: {
      idRol: usuario.rol.idRol,
      nombreRol: usuario.rol.nombreRol
    }
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Usuario de prueba
const usuarioFisio = {
  idUsuario: 2,
  correoElectronico: 'fisio@test.com',
  nombre: 'Fisio',
  apellido1: 'Test',
  rol: { idRol: ROLES.FISIOTERAPEUTA, nombreRol: ROLE_NAMES[ROLES.FISIOTERAPEUTA] }
};

const token = createToken(usuarioFisio);

// Función para hacer peticiones HTTP con medición de tiempo
const makeRequestWithTiming = async (method, endpoint, body = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return { 
      status: response.status, 
      data, 
      duration,
      success: response.status >= 200 && response.status < 300
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    return { 
      status: 0, 
      data: { error: error.message }, 
      duration,
      success: false
    };
  }
};

// Función para ejecutar múltiples peticiones en paralelo
const runConcurrentRequests = async (requestFn, count, delay = 0) => {
  const promises = [];
  for (let i = 0; i < count; i++) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    promises.push(requestFn());
  }
  return Promise.all(promises);
};

// Función para calcular estadísticas
const calculateStats = (results) => {
  const durations = results.map(r => r.duration);
  const successful = results.filter(r => r.success);
  
  return {
    total: results.length,
    successful: successful.length,
    failed: results.length - successful.length,
    successRate: (successful.length / results.length) * 100,
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    medianDuration: durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
  };
};

// Función para imprimir resultados de rendimiento
const printPerformanceResult = (testName, stats) => {
  console.log(`\n📊 ${testName}:`);
  console.log(`   Total: ${stats.total}`);
  console.log(`   Exitosas: ${stats.successful} (${stats.successRate.toFixed(1)}%)`);
  console.log(`   Fallidas: ${stats.failed}`);
  console.log(`   Tiempo promedio: ${stats.avgDuration.toFixed(2)}ms`);
  console.log(`   Tiempo mínimo: ${stats.minDuration}ms`);
  console.log(`   Tiempo máximo: ${stats.maxDuration}ms`);
  console.log(`   Tiempo mediano: ${stats.medianDuration}ms`);
};

// Pruebas de rendimiento
const runPerformanceTests = async () => {
  console.log('⚡ Iniciando pruebas de rendimiento de Expedientes...\n');
  
  // Test 1: GET /expedientes - Peticiones secuenciales
  console.log('🔍 Test 1: GET /expedientes - Peticiones secuenciales (10 peticiones)');
  const sequentialResults = [];
  for (let i = 0; i < 10; i++) {
    const result = await makeRequestWithTiming('GET', '/expedientes');
    sequentialResults.push(result);
  }
  printPerformanceResult('GET /expedientes (Secuencial)', calculateStats(sequentialResults));

  // Test 2: GET /expedientes - Peticiones concurrentes
  console.log('\n🔍 Test 2: GET /expedientes - Peticiones concurrentes (20 peticiones)');
  const concurrentResults = await runConcurrentRequests(
    () => makeRequestWithTiming('GET', '/expedientes'),
    20
  );
  printPerformanceResult('GET /expedientes (Concurrente)', calculateStats(concurrentResults));

  // Test 3: POST /expedientes - Crear expedientes
  console.log('\n🔍 Test 3: POST /expedientes - Crear expedientes (5 peticiones)');
  const createResults = [];
  for (let i = 0; i < 5; i++) {
    const expedienteData = {
      idPaciente: 4,
      cedula: `test${Date.now()}${i}`,
      estado: 'activo',
      idMedico: 2,
      descripcion: `Expediente de prueba ${i}`
    };
    const result = await makeRequestWithTiming('POST', '/expedientes', expedienteData);
    createResults.push(result);
  }
  printPerformanceResult('POST /expedientes', calculateStats(createResults));

  // Test 4: GET /expedientes con filtros
  console.log('\n🔍 Test 4: GET /expedientes con filtros (10 peticiones)');
  const filterResults = await runConcurrentRequests(
    () => makeRequestWithTiming('GET', '/expedientes?estado=activo&page=1&limit=5'),
    10
  );
  printPerformanceResult('GET /expedientes (Con filtros)', calculateStats(filterResults));

  // Test 5: GET /expedientes/:id - Peticiones individuales
  console.log('\n🔍 Test 5: GET /expedientes/:id - Peticiones individuales (10 peticiones)');
  const individualResults = [];
  for (let i = 1; i <= 10; i++) {
    const result = await makeRequestWithTiming('GET', `/expedientes/${i}`);
    individualResults.push(result);
  }
  printPerformanceResult('GET /expedientes/:id', calculateStats(individualResults));

  // Test 6: PUT /expedientes/:id - Actualizaciones
  console.log('\n🔍 Test 6: PUT /expedientes/:id - Actualizaciones (5 peticiones)');
  const updateResults = [];
  for (let i = 1; i <= 5; i++) {
    const updateData = {
      estado: 'en_tratamiento',
      descripcion: `Actualizado ${Date.now()}`
    };
    const result = await makeRequestWithTiming('PUT', `/expedientes/${i}`, updateData);
    updateResults.push(result);
  }
  printPerformanceResult('PUT /expedientes/:id', calculateStats(updateResults));

  // Test 7: Carga pesada - Múltiples peticiones concurrentes
  console.log('\n🔍 Test 7: Carga pesada - 50 peticiones concurrentes');
  const heavyLoadResults = await runConcurrentRequests(
    () => makeRequestWithTiming('GET', '/expedientes'),
    50
  );
  printPerformanceResult('Carga pesada (50 concurrentes)', calculateStats(heavyLoadResults));

  // Test 8: Prueba de estrés - Peticiones con delay mínimo
  console.log('\n🔍 Test 8: Prueba de estrés - 30 peticiones con delay mínimo');
  const stressResults = await runConcurrentRequests(
    () => makeRequestWithTiming('GET', '/expedientes'),
    30,
    10 // 10ms de delay entre peticiones
  );
  printPerformanceResult('Prueba de estrés', calculateStats(stressResults));

  // Resumen general
  console.log('\n📈 Resumen general de rendimiento:');
  const allResults = [
    ...sequentialResults,
    ...concurrentResults,
    ...createResults,
    ...filterResults,
    ...individualResults,
    ...updateResults,
    ...heavyLoadResults,
    ...stressResults
  ];
  
  const overallStats = calculateStats(allResults);
  printPerformanceResult('TODAS LAS PRUEBAS', overallStats);

  // Recomendaciones
  console.log('\n💡 Recomendaciones:');
  if (overallStats.avgDuration > 1000) {
    console.log('   ⚠️  Tiempo de respuesta promedio alto (>1000ms)');
    console.log('   - Considera optimizar las consultas a la base de datos');
    console.log('   - Revisa los índices en la base de datos');
  } else if (overallStats.avgDuration > 500) {
    console.log('   ⚠️  Tiempo de respuesta promedio moderado (>500ms)');
    console.log('   - Considera implementar caché para consultas frecuentes');
  } else {
    console.log('   ✅ Tiempo de respuesta promedio excelente (<500ms)');
  }

  if (overallStats.successRate < 95) {
    console.log('   ⚠️  Tasa de éxito baja (<95%)');
    console.log('   - Revisa el manejo de errores y la estabilidad del servidor');
  } else {
    console.log('   ✅ Tasa de éxito excelente (>95%)');
  }

  if (overallStats.maxDuration > overallStats.avgDuration * 3) {
    console.log('   ⚠️  Variabilidad alta en tiempos de respuesta');
    console.log('   - Revisa la consistencia del rendimiento');
  }
};

// Ejecutar pruebas si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests().catch(console.error);
}

export {
  runPerformanceTests,
  makeRequestWithTiming,
  calculateStats
};
