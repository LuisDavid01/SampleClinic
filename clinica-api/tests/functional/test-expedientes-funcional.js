import jwt from 'jsonwebtoken';
import config from './src/config/env.js';
import { ROLES, ROLE_NAMES } from './src/constants/roles.js';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_TIMEOUT = 10000; // 10 segundos

// Crear tokens para diferentes roles
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

// Usuarios de prueba
const usuarios = {
  admin: {
    idUsuario: 1,
    correoElectronico: 'admin@test.com',
    nombre: 'Admin',
    apellido1: 'Test',
    rol: { idRol: ROLES.ADMINISTRADOR, nombreRol: ROLE_NAMES[ROLES.ADMINISTRADOR] }
  },
  fisioterapeuta: {
    idUsuario: 2,
    correoElectronico: 'fisio@test.com',
    nombre: 'Fisio',
    apellido1: 'Test',
    rol: { idRol: ROLES.FISIOTERAPEUTA, nombreRol: ROLE_NAMES[ROLES.FISIOTERAPEUTA] }
  },
  paciente: {
    idUsuario: 4,
    correoElectronico: 'paciente@test.com',
    nombre: 'Paciente',
    apellido1: 'Test',
    rol: { idRol: ROLES.PACIENTE, nombreRol: ROLE_NAMES[ROLES.PACIENTE] }
  }
};

// Generar tokens
const tokens = {};
Object.keys(usuarios).forEach(role => {
  tokens[role] = createToken(usuarios[role]);
});

// Función para hacer peticiones HTTP
const makeRequest = async (method, endpoint, token = null, body = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
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

// Función para imprimir resultados de prueba
const printTestResult = (testName, passed, details = '') => {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
};

// Función para esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Datos de prueba
const expedienteTestData = {
  idPaciente: 4,
  cedula: '12345678',
  estado: 'activo',
  idMedico: 2,
  descripcion: 'Expediente de prueba para paciente'
};

const expedienteUpdateData = {
  estado: 'en_tratamiento',
  descripcion: 'Expediente actualizado - en tratamiento'
};

// Pruebas
const runTests = async () => {
  console.log('🧪 Iniciando pruebas funcionales de Expedientes...\n');
  
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

  // Test 2: GET /expedientes sin autenticación
  totalTests++;
  console.log('\n🔍 Test 2: GET /expedientes sin autenticación');
  const getWithoutAuth = await makeRequest('GET', '/expedientes');
  if (getWithoutAuth.status === 401) {
    printTestResult('Rechaza peticiones sin autenticación', true);
    passedTests++;
  } else {
    printTestResult('Rechaza peticiones sin autenticación', false, `Status: ${getWithoutAuth.status}`);
  }

  // Test 3: GET /expedientes con token de paciente
  totalTests++;
  console.log('\n🔍 Test 3: GET /expedientes con token de paciente');
  const getAsPaciente = await makeRequest('GET', '/expedientes', tokens.paciente);
  if (getAsPaciente.status === 200) {
    printTestResult('Paciente puede ver expedientes', true, `Encontrados: ${getAsPaciente.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Paciente puede ver expedientes', false, `Status: ${getAsPaciente.status}`);
  }

  // Test 4: GET /expedientes con token de fisioterapeuta
  totalTests++;
  console.log('\n🔍 Test 4: GET /expedientes con token de fisioterapeuta');
  const getAsFisio = await makeRequest('GET', '/expedientes', tokens.fisioterapeuta);
  if (getAsFisio.status === 200) {
    printTestResult('Fisioterapeuta puede ver expedientes', true, `Encontrados: ${getAsFisio.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Fisioterapeuta puede ver expedientes', false, `Status: ${getAsFisio.status}`);
  }

  // Test 5: POST /expedientes con token de paciente (debería fallar)
  totalTests++;
  console.log('\n🔍 Test 5: POST /expedientes con token de paciente (debería fallar)');
  const postAsPaciente = await makeRequest('POST', '/expedientes', tokens.paciente, expedienteTestData);
  if (postAsPaciente.status === 403) {
    printTestResult('Paciente no puede crear expedientes', true);
    passedTests++;
  } else {
    printTestResult('Paciente no puede crear expedientes', false, `Status: ${postAsPaciente.status}`);
  }

  // Test 6: POST /expedientes con token de fisioterapeuta
  totalTests++;
  console.log('\n🔍 Test 6: POST /expedientes con token de fisioterapeuta');
  const postAsFisio = await makeRequest('POST', '/expedientes', tokens.fisioterapeuta, expedienteTestData);
  if (postAsFisio.status === 201) {
    expedienteId = postAsFisio.data.data?.idExpediente;
    printTestResult('Fisioterapeuta puede crear expedientes', true, `ID: ${expedienteId}`);
    passedTests++;
  } else {
    printTestResult('Fisioterapeuta puede crear expedientes', false, `Status: ${postAsFisio.status}, Error: ${JSON.stringify(postAsFisio.data)}`);
  }

  // Test 7: POST /expedientes con datos inválidos
  totalTests++;
  console.log('\n🔍 Test 7: POST /expedientes con datos inválidos');
  const invalidData = { idPaciente: 4 }; // Faltan campos requeridos
  const postInvalid = await makeRequest('POST', '/expedientes', tokens.fisioterapeuta, invalidData);
  if (postInvalid.status === 400) {
    printTestResult('Valida datos requeridos', true);
    passedTests++;
  } else {
    printTestResult('Valida datos requeridos', false, `Status: ${postInvalid.status}`);
  }

  // Test 8: GET /expedientes/:id con expediente existente
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 8: GET /expedientes/:id con expediente existente');
    const getById = await makeRequest('GET', `/expedientes/${expedienteId}`, tokens.fisioterapeuta);
    if (getById.status === 200) {
      printTestResult('Obtener expediente por ID', true, `Cédula: ${getById.data.data?.cedula}`);
      passedTests++;
    } else {
      printTestResult('Obtener expediente por ID', false, `Status: ${getById.status}`);
    }
  }

  // Test 9: GET /expedientes/:id con ID inexistente
  totalTests++;
  console.log('\n🔍 Test 9: GET /expedientes/:id con ID inexistente');
  const getByInvalidId = await makeRequest('GET', '/expedientes/99999', tokens.fisioterapeuta);
  if (getByInvalidId.status === 404) {
    printTestResult('Maneja ID inexistente', true);
    passedTests++;
  } else {
    printTestResult('Maneja ID inexistente', false, `Status: ${getByInvalidId.status}`);
  }

  // Test 10: PUT /expedientes/:id con token de fisioterapeuta
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 10: PUT /expedientes/:id con token de fisioterapeuta');
    const putAsFisio = await makeRequest('PUT', `/expedientes/${expedienteId}`, tokens.fisioterapeuta, expedienteUpdateData);
    if (putAsFisio.status === 200) {
      printTestResult('Fisioterapeuta puede actualizar expedientes', true, `Estado: ${putAsFisio.data.data?.estado}`);
      passedTests++;
    } else {
      printTestResult('Fisioterapeuta puede actualizar expedientes', false, `Status: ${putAsFisio.status}`);
    }
  }

  // Test 11: PUT /expedientes/:id con token de paciente (debería fallar)
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 11: PUT /expedientes/:id con token de paciente (debería fallar)');
    const putAsPaciente = await makeRequest('PUT', `/expedientes/${expedienteId}`, tokens.paciente, expedienteUpdateData);
    if (putAsPaciente.status === 403) {
      printTestResult('Paciente no puede actualizar expedientes', true);
      passedTests++;
    } else {
      printTestResult('Paciente no puede actualizar expedientes', false, `Status: ${putAsPaciente.status}`);
    }
  }

  // Test 12: DELETE /expedientes/:id con token de fisioterapeuta (debería fallar)
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 12: DELETE /expedientes/:id con token de fisioterapeuta (debería fallar)');
    const deleteAsFisio = await makeRequest('DELETE', `/expedientes/${expedienteId}`, tokens.fisioterapeuta);
    if (deleteAsFisio.status === 403) {
      printTestResult('Fisioterapeuta no puede eliminar expedientes', true);
      passedTests++;
    } else {
      printTestResult('Fisioterapeuta no puede eliminar expedientes', false, `Status: ${deleteAsFisio.status}`);
    }
  }

  // Test 13: DELETE /expedientes/:id con token de admin
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 13: DELETE /expedientes/:id con token de admin');
    const deleteAsAdmin = await makeRequest('DELETE', `/expedientes/${expedienteId}`, tokens.admin);
    if (deleteAsAdmin.status === 200) {
      printTestResult('Admin puede eliminar expedientes', true);
      passedTests++;
    } else {
      printTestResult('Admin puede eliminar expedientes', false, `Status: ${deleteAsAdmin.status}`);
    }
  }

  // Test 14: Filtros en GET /expedientes
  totalTests++;
  console.log('\n🔍 Test 14: Filtros en GET /expedientes');
  const getWithFilters = await makeRequest('GET', '/expedientes?cedula=12345678&estado=activo', tokens.fisioterapeuta);
  if (getWithFilters.status === 200) {
    printTestResult('Filtros funcionan correctamente', true, `Encontrados: ${getWithFilters.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Filtros funcionan correctamente', false, `Status: ${getWithFilters.status}`);
  }

  // Test 15: Paginación en GET /expedientes
  totalTests++;
  console.log('\n🔍 Test 15: Paginación en GET /expedientes');
  const getWithPagination = await makeRequest('GET', '/expedientes?page=1&limit=5', tokens.fisioterapeuta);
  if (getWithPagination.status === 200) {
    const hasPagination = getWithPagination.data.pagination;
    printTestResult('Paginación funciona correctamente', hasPagination, 
      hasPagination ? `Página: ${getWithPagination.data.pagination.page}` : 'Sin paginación');
    passedTests++;
  } else {
    printTestResult('Paginación funciona correctamente', false, `Status: ${getWithPagination.status}`);
  }

  // Resumen final
  console.log('\n📊 Resumen de pruebas:');
  console.log(`✅ Pasaron: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallaron: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los detalles arriba.');
  }
};

// Ejecutar pruebas si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  runTests,
  makeRequest,
  tokens,
  usuarios
};
