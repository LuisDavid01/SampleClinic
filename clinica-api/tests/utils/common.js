/**
 * Utilidades comunes para todas las pruebas
 */

import { API_CONFIG, COLORS, SYMBOLS } from '../config.js';

/**
 * Función para hacer peticiones HTTP con configuración común
 */
export const makeRequest = async (method, endpoint, token = null, body = null) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

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

/**
 * Función para imprimir resultados de prueba con formato
 */
export const printTestResult = (testName, passed, details = '') => {
  const status = passed ? SYMBOLS.SUCCESS : SYMBOLS.ERROR;
  const color = passed ? COLORS.GREEN : COLORS.RED;
  
  console.log(`${color}${status} ${testName}${COLORS.RESET}`);
  if (details) {
    console.log(`${COLORS.DIM}   ${details}${COLORS.RESET}`);
  }
};

/**
 * Función para imprimir encabezados de sección
 */
export const printSectionHeader = (title, emoji = SYMBOLS.TEST) => {
  console.log(`\n${COLORS.CYAN}${emoji} ${title}${COLORS.RESET}`);
  console.log(`${COLORS.DIM}${'='.repeat(title.length + 4)}${COLORS.RESET}`);
};

/**
 * Función para imprimir resumen de pruebas
 */
export const printTestSummary = (passed, total, section = '') => {
  const percentage = Math.round((passed / total) * 100);
  const color = percentage >= 80 ? COLORS.GREEN : percentage >= 60 ? COLORS.YELLOW : COLORS.RED;
  
  console.log(`\n${COLORS.BRIGHT}📊 Resumen${section ? ` de ${section}` : ''}:${COLORS.RESET}`);
  console.log(`${COLORS.GREEN}✅ Pasaron: ${passed}/${total}${COLORS.RESET}`);
  console.log(`${COLORS.RED}❌ Fallaron: ${total - passed}/${total}${COLORS.RESET}`);
  console.log(`${color}📈 Porcentaje: ${percentage}%${COLORS.RESET}`);
  
  if (percentage === 100) {
    console.log(`\n${COLORS.GREEN}${SYMBOLS.ROCKET} ¡Todas las pruebas pasaron exitosamente!${COLORS.RESET}`);
  } else if (percentage >= 80) {
    console.log(`\n${COLORS.YELLOW}${SYMBOLS.WARNING} La mayoría de las pruebas pasaron. Revisa las fallidas.${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.RED}${SYMBOLS.ERROR} Varias pruebas fallaron. Revisa los detalles arriba.${COLORS.RESET}`);
  }
};

/**
 * Función para esperar un tiempo determinado
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función para generar datos únicos de prueba
 */
export const generateUniqueTestData = (baseData) => {
  const timestamp = Date.now();
  return {
    ...baseData,
    cedula: `test${timestamp}`,
    descripcion: `${baseData.descripcion || 'Prueba'} - ${timestamp}`
  };
};

/**
 * Función para validar respuesta de API
 */
export const validateApiResponse = (response, expectedStatus = 200) => {
  return {
    isValid: response.status === expectedStatus,
    hasData: response.data && typeof response.data === 'object',
    isError: response.status >= 400,
    status: response.status,
    data: response.data
  };
};

/**
 * Función para calcular estadísticas de rendimiento
 */
export const calculatePerformanceStats = (results) => {
  const durations = results.map(r => r.duration || 0);
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

/**
 * Función para imprimir estadísticas de rendimiento
 */
export const printPerformanceStats = (stats, testName) => {
  console.log(`\n${COLORS.BLUE}📊 ${testName}:${COLORS.RESET}`);
  console.log(`   Total: ${stats.total}`);
  console.log(`   Exitosas: ${stats.successful} (${stats.successRate.toFixed(1)}%)`);
  console.log(`   Fallidas: ${stats.failed}`);
  console.log(`   Tiempo promedio: ${stats.avgDuration.toFixed(2)}ms`);
  console.log(`   Tiempo mínimo: ${stats.minDuration}ms`);
  console.log(`   Tiempo máximo: ${stats.maxDuration}ms`);
  console.log(`   Tiempo mediano: ${stats.medianDuration}ms`);
};

/**
 * Función para verificar que el servidor esté funcionando
 */
export const checkServerHealth = async () => {
  try {
    const response = await makeRequest('GET', API_CONFIG.HEALTH_ENDPOINT);
    return {
      isHealthy: response.status === 200,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      isHealthy: false,
      status: 0,
      error: error.message
    };
  }
};
