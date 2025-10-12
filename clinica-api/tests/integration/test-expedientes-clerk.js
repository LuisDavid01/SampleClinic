import jwt from 'jsonwebtoken';
import config from './src/config/env.js';
import { ROLES, ROLE_NAMES } from './src/constants/roles.js';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Simular tokens de Clerk (en un entorno real, estos vendrían de Clerk)
const createClerkToken = (usuario) => {
  // Simular la estructura de token de Clerk
  const payload = {
    sub: `user_${usuario.idUsuario}`, // Clerk user ID
    email: usuario.correoElectronico,
    name: `${usuario.nombre} ${usuario.apellido1}`,
    metadata: {
      idUsuario: usuario.idUsuario,
      rol: usuario.rol.nombreRol,
      idRol: usuario.rol.idRol
    },
    iat: Math.floor(Date.now() / 1000)
  };

  // En un entorno real, esto sería firmado por Clerk
  // Aquí usamos nuestra clave JWT para simular
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h'
  });
};

// Usuarios de prueba con estructura de Clerk
const usuariosClerk = {
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

// Generar tokens de Clerk
const clerkTokens = {};
Object.keys(usuariosClerk).forEach(role => {
  clerkTokens[role] = createClerkToken(usuariosClerk[role]);
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

// Datos de prueba
const expedienteTestData = {
  idPaciente: 4,
  cedula: '12345678',
  estado: 'activo',
  idMedico: 2,
  descripcion: 'Expediente de prueba con Clerk'
};

// Pruebas específicas para Clerk
const runClerkTests = async () => {
  console.log('🔐 Iniciando pruebas de integración con Clerk...\n');
  
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

  // Test 2: GET /expedientes con token de Clerk (paciente)
  totalTests++;
  console.log('\n🔍 Test 2: GET /expedientes con token de Clerk (paciente)');
  const getAsPacienteClerk = await makeRequest('GET', '/expedientes', clerkTokens.paciente);
  if (getAsPacienteClerk.status === 200) {
    printTestResult('Paciente con Clerk puede ver expedientes', true, `Encontrados: ${getAsPacienteClerk.data.data?.length || 0}`);
    passedTests++;
  } else {
    printTestResult('Paciente con Clerk puede ver expedientes', false, `Status: ${getAsPacienteClerk.status}`);
  }

  // Test 3: POST /expedientes con token de Clerk (fisioterapeuta)
  totalTests++;
  console.log('\n🔍 Test 3: POST /expedientes con token de Clerk (fisioterapeuta)');
  const postAsFisioClerk = await makeRequest('POST', '/expedientes', clerkTokens.fisioterapeuta, expedienteTestData);
  if (postAsFisioClerk.status === 201) {
    expedienteId = postAsFisioClerk.data.data?.idExpediente;
    printTestResult('Fisioterapeuta con Clerk puede crear expedientes', true, `ID: ${expedienteId}`);
    passedTests++;
  } else {
    printTestResult('Fisioterapeuta con Clerk puede crear expedientes', false, `Status: ${postAsFisioClerk.status}, Error: ${JSON.stringify(postAsFisioClerk.data)}`);
  }

  // Test 4: GET /expedientes/:id con token de Clerk
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 4: GET /expedientes/:id con token de Clerk');
    const getByIdClerk = await makeRequest('GET', `/expedientes/${expedienteId}`, clerkTokens.fisioterapeuta);
    if (getByIdClerk.status === 200) {
      printTestResult('Obtener expediente por ID con Clerk', true, `Cédula: ${getByIdClerk.data.data?.cedula}`);
      passedTests++;
    } else {
      printTestResult('Obtener expediente por ID con Clerk', false, `Status: ${getByIdClerk.status}`);
    }
  }

  // Test 5: PUT /expedientes/:id con token de Clerk
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 5: PUT /expedientes/:id con token de Clerk');
    const updateData = { estado: 'en_tratamiento', descripcion: 'Actualizado con Clerk' };
    const putAsFisioClerk = await makeRequest('PUT', `/expedientes/${expedienteId}`, clerkTokens.fisioterapeuta, updateData);
    if (putAsFisioClerk.status === 200) {
      printTestResult('Actualizar expediente con Clerk', true, `Estado: ${putAsFisioClerk.data.data?.estado}`);
      passedTests++;
    } else {
      printTestResult('Actualizar expediente con Clerk', false, `Status: ${putAsFisioClerk.status}`);
    }
  }

  // Test 6: DELETE /expedientes/:id con token de Clerk (admin)
  if (expedienteId) {
    totalTests++;
    console.log('\n🔍 Test 6: DELETE /expedientes/:id con token de Clerk (admin)');
    const deleteAsAdminClerk = await makeRequest('DELETE', `/expedientes/${expedienteId}`, clerkTokens.admin);
    if (deleteAsAdminClerk.status === 200) {
      printTestResult('Eliminar expediente con Clerk', true);
      passedTests++;
    } else {
      printTestResult('Eliminar expediente con Clerk', false, `Status: ${deleteAsAdminClerk.status}`);
    }
  }

  // Test 7: Verificar que el middleware de Clerk funcione correctamente
  totalTests++;
  console.log('\n🔍 Test 7: Verificar middleware de Clerk');
  const getWithoutToken = await makeRequest('GET', '/expedientes');
  if (getWithoutToken.status === 401) {
    printTestResult('Middleware de Clerk rechaza peticiones sin token', true);
    passedTests++;
  } else {
    printTestResult('Middleware de Clerk rechaza peticiones sin token', false, `Status: ${getWithoutToken.status}`);
  }

  // Test 8: Verificar autorización por roles con Clerk
  totalTests++;
  console.log('\n🔍 Test 8: Verificar autorización por roles con Clerk');
  const postAsPacienteClerk = await makeRequest('POST', '/expedientes', clerkTokens.paciente, expedienteTestData);
  if (postAsPacienteClerk.status === 403) {
    printTestResult('Clerk respeta autorización por roles', true);
    passedTests++;
  } else {
    printTestResult('Clerk respeta autorización por roles', false, `Status: ${postAsPacienteClerk.status}`);
  }

  // Resumen final
  console.log('\n📊 Resumen de pruebas de Clerk:');
  console.log(`✅ Pasaron: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallaron: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todas las pruebas de Clerk pasaron exitosamente!');
  } else {
    console.log('\n⚠️  Algunas pruebas de Clerk fallaron. Revisa los detalles arriba.');
  }
};

// Mostrar tokens de Clerk para pruebas manuales
const showClerkTokens = () => {
  console.log('🔑 Tokens de Clerk para pruebas manuales:\n');
  
  Object.keys(usuariosClerk).forEach(role => {
    const usuario = usuariosClerk[role];
    const token = clerkTokens[role];
    console.log(`--- ${usuario.rol.nombreRol} (Clerk) ---`);
    console.log(`Email: ${usuario.correoElectronico}`);
    console.log(`Clerk User ID: user_${usuario.idUsuario}`);
    console.log(`Token: ${token}`);
    console.log('');
  });

  console.log('📋 Instrucciones para probar con Clerk:');
  console.log('1. Ve a http://localhost:3000/api-docs');
  console.log('2. Haz clic en "Authorize" (🔒)');
  console.log('3. Usa uno de los tokens de Clerk de arriba');
  console.log('4. Prueba los endpoints de expedientes');
  console.log('');
  console.log('🔍 Nota: Estos tokens simulan la estructura de Clerk');
  console.log('   En producción, los tokens vendrían directamente de Clerk');
};

// Ejecutar pruebas si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--tokens')) {
    showClerkTokens();
  } else {
    runClerkTests().catch(console.error);
  }
}

export {
  runClerkTests,
  showClerkTokens,
  makeRequest,
  clerkTokens,
  usuariosClerk
};
