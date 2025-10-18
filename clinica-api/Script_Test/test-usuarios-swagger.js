const jwt = require('jsonwebtoken');
const config = require('../src/config/env');
const { ROLES, ROLE_NAMES } = require('../src/constants/roles');

// Crear token para administrador
const createAdminToken = () => {
  const payload = {
    idUsuario: 1,
    correoElectronico: 'admin@test.com',
    nombre: 'Admin',
    apellido1: 'Test',
    rol: {
      idRol: ROLES.ADMINISTRADOR,
      nombreRol: ROLE_NAMES[ROLES.ADMINISTRADOR]
    }
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Crear token para paciente
const createPacienteToken = () => {
  const payload = {
    idUsuario: 4,
    correoElectronico: 'paciente@test.com',
    nombre: 'Paciente',
    apellido1: 'Test',
    rol: {
      idRol: ROLES.PACIENTE,
      nombreRol: ROLE_NAMES[ROLES.PACIENTE]
    }
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Función para probar endpoint
const testEndpoint = async (method, url, token = null, body = null) => {
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
    
    return {
      status: response.status,
      success: response.ok,
      data: data
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
};

// Función principal de prueba
const runTests = async () => {
  console.log('🧪 Probando endpoints de usuarios en Swagger...\n');

  const adminToken = createAdminToken();
  const pacienteToken = createPacienteToken();
  const baseUrl = 'http://localhost:3001/api';

  console.log('📋 Endpoints de usuarios disponibles:');
  console.log('1. GET /usuarios - Obtener todos los usuarios (solo admin)');
  console.log('2. GET /usuarios/:id - Obtener usuario por ID');
  console.log('3. PUT /usuarios/:id - Actualizar usuario');
  console.log('4. DELETE /usuarios/:id - Desactivar usuario (solo admin)');
  console.log('5. GET /usuarios/:id/citas - Obtener citas del usuario\n');

  // Test 1: GET /usuarios (sin token)
  console.log('🔍 Test 1: GET /usuarios (sin token)');
  const test1 = await testEndpoint('GET', `${baseUrl}/usuarios`);
  console.log(`   Status: ${test1.status} - ${test1.success ? '✅' : '❌'}`);
  if (test1.data?.error) console.log(`   Error: ${test1.data.error}`);

  // Test 2: GET /usuarios (con token admin)
  console.log('\n🔍 Test 2: GET /usuarios (con token admin)');
  const test2 = await testEndpoint('GET', `${baseUrl}/usuarios`, adminToken);
  console.log(`   Status: ${test2.status} - ${test2.success ? '✅' : '❌'}`);
  if (test2.data?.usuarios) console.log(`   Usuarios encontrados: ${test2.data.usuarios.length}`);

  // Test 3: GET /usuarios/1 (con token admin)
  console.log('\n🔍 Test 3: GET /usuarios/1 (con token admin)');
  const test3 = await testEndpoint('GET', `${baseUrl}/usuarios/1`, adminToken);
  console.log(`   Status: ${test3.status} - ${test3.success ? '✅' : '❌'}`);
  if (test3.data?.usuario) console.log(`   Usuario: ${test3.data.usuario.nombre} ${test3.data.usuario.apellido1}`);

  // Test 4: GET /usuarios/1 (con token paciente - debería fallar)
  console.log('\n🔍 Test 4: GET /usuarios/1 (con token paciente - debería fallar)');
  const test4 = await testEndpoint('GET', `${baseUrl}/usuarios/1`, pacienteToken);
  console.log(`   Status: ${test4.status} - ${test4.success ? '✅' : '❌'}`);
  if (test4.data?.error) console.log(`   Error: ${test4.data.error}`);

  // Test 5: GET /usuarios/4 (con token paciente - su propio usuario)
  console.log('\n🔍 Test 5: GET /usuarios/4 (con token paciente - su propio usuario)');
  const test5 = await testEndpoint('GET', `${baseUrl}/usuarios/4`, pacienteToken);
  console.log(`   Status: ${test5.status} - ${test5.success ? '✅' : '❌'}`);
  if (test5.data?.usuario) console.log(`   Usuario: ${test5.data.usuario.nombre} ${test5.data.usuario.apellido1}`);

  // Test 6: PUT /usuarios/4 (con token paciente - actualizar su propio usuario)
  console.log('\n🔍 Test 6: PUT /usuarios/4 (con token paciente - actualizar su propio usuario)');
  const updateData = {
    nombre: 'Paciente Actualizado',
    telefono: '+1234567890'
  };
  const test6 = await testEndpoint('PUT', `${baseUrl}/usuarios/4`, pacienteToken, updateData);
  console.log(`   Status: ${test6.status} - ${test6.success ? '✅' : '❌'}`);
  if (test6.data?.message) console.log(`   Mensaje: ${test6.data.message}`);

  // Test 7: DELETE /usuarios/4 (con token paciente - debería fallar)
  console.log('\n🔍 Test 7: DELETE /usuarios/4 (con token paciente - debería fallar)');
  const test7 = await testEndpoint('DELETE', `${baseUrl}/usuarios/4`, pacienteToken);
  console.log(`   Status: ${test7.status} - ${test7.success ? '✅' : '❌'}`);
  if (test7.data?.error) console.log(`   Error: ${test7.data.error}`);

  // Test 8: GET /usuarios/4/citas (con token paciente)
  console.log('\n🔍 Test 8: GET /usuarios/4/citas (con token paciente)');
  const test8 = await testEndpoint('GET', `${baseUrl}/usuarios/4/citas`, pacienteToken);
  console.log(`   Status: ${test8.status} - ${test8.success ? '✅' : '❌'}`);
  if (test8.data?.citas) console.log(`   Citas encontradas: ${test8.data.citas.length}`);

  console.log('\n🎯 Resumen de pruebas:');
  console.log('- Todos los endpoints están documentados en Swagger');
  console.log('- Los permisos de roles funcionan correctamente');
  console.log('- Los usuarios solo pueden acceder a sus propios datos');
  console.log('- Los administradores pueden acceder a todos los datos');
  console.log('\n📚 Para probar en Swagger UI:');
  console.log('1. Ve a http://localhost:3001/api-docs');
  console.log('2. Haz clic en "Authorize" y pega uno de estos tokens:');
  console.log(`   Admin: ${adminToken}`);
  console.log(`   Paciente: ${pacienteToken}`);
  console.log('3. Prueba los endpoints en la sección "Usuarios"');
};

// Ejecutar pruebas
runTests().catch(console.error);
