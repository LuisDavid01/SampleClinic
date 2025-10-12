/**
 * Configuración centralizada para todas las pruebas
 */

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 segundos
  HEALTH_ENDPOINT: '/health'
};

// Configuración de roles
export const ROLES = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  RECEPCIONISTA: 'recepcionista',
  PACIENTE: 'paciente'
};

// Configuración de datos de prueba
export const TEST_DATA = {
  USERS: {
    ADMIN: {
      idUsuario: 1,
      correoElectronico: 'admin@clinica.com',
      nombre: 'Admin',
      apellido1: 'Sistema'
    },
    MEDICO: {
      idUsuario: 2,
      correoElectronico: 'juan.perez@clinica.com',
      nombre: 'Dr. Juan',
      apellido1: 'Pérez'
    },
    PACIENTE: {
      idUsuario: 4,
      correoElectronico: 'carlos.rodriguez@clinica.com',
      nombre: 'Carlos',
      apellido1: 'Rodríguez'
    }
  },
  
  EXPEDIENTES: {
    VALID: {
      idPaciente: 4,
      cedula: `test${Date.now()}`,
      estado: 'activo',
      idMedico: 2,
      descripcion: 'Expediente de prueba'
    },
    INVALID: {
      idPaciente: 4
      // Faltan campos requeridos
    },
    UPDATE: {
      estado: 'en_tratamiento',
      descripcion: 'Expediente actualizado'
    }
  }
};

// Configuración de pruebas de rendimiento
export const PERFORMANCE_CONFIG = {
  CONCURRENT_REQUESTS: 20,
  SEQUENTIAL_REQUESTS: 10,
  HEAVY_LOAD_REQUESTS: 50,
  STRESS_TEST_REQUESTS: 30,
  STRESS_TEST_DELAY: 10 // ms
};

// Configuración de métricas
export const METRICS = {
  SUCCESS_RATE_THRESHOLD: 95, // %
  AVG_RESPONSE_TIME_THRESHOLD: 1000, // ms
  MAX_RESPONSE_TIME_THRESHOLD: 3000 // ms
};

// Colores para consola
export const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  DIM: '\x1b[2m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

// Símbolos para consola
export const SYMBOLS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  LOADING: '🔄',
  ROCKET: '🚀',
  GEAR: '⚙️',
  TEST: '🧪',
  LOCK: '🔒',
  KEY: '🔑'
};
