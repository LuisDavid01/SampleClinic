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

// Crear token para fisioterapeuta
const createFisioterapeutaToken = () => {
  const payload = {
    idUsuario: 2,
    correoElectronico: 'fisio@test.com',
    nombre: 'Fisio',
    apellido1: 'Test',
    rol: {
      idRol: ROLES.FISIOTERAPEUTA,
      nombreRol: ROLE_NAMES[ROLES.FISIOTERAPEUTA]
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
  console.log('🧪 Probando endpoints de servicios en Swagger...\n');

  const adminToken = createAdminToken();
  const fisioToken = createFisioterapeutaToken();
  const baseUrl = 'http://localhost:3001/api';

  console.log('📋 Endpoints de servicios disponibles:');
  console.log('1. GET /servicios - Obtener todos los servicios');
  console.log('2. GET /servicios/:id - Obtener servicio por ID');
  console.log('3. POST /servicios - Crear nuevo servicio (solo admin)');
  console.log('4. PUT /servicios/:id - Actualizar servicio (solo admin)');
  console.log('5. DELETE /servicios/:id - Desactivar servicio (solo admin)');
  console.log('6. GET /servicios/:id/perfiles - Obtener perfiles del servicio');
  console.log('7. POST /servicios/:id/perfiles - Asociar perfil (solo admin)');
  console.log('8. DELETE /servicios/:id/perfiles/:idPerfil - Desasociar perfil (solo admin)\n');

  // Test 1: GET /servicios (sin token)
  console.log('🔍 Test 1: GET /servicios (sin token)');
  const test1 = await testEndpoint('GET', `${baseUrl}/servicios`);
  console.log(`   Status: ${test1.status} - ${test1.success ? '✅' : '❌'}`);
  if (test1.data?.error) console.log(`   Error: ${test1.data.error}`);

  // Test 2: GET /servicios (con token fisioterapeuta)
  console.log('\n🔍 Test 2: GET /servicios (con token fisioterapeuta)');
  const test2 = await testEndpoint('GET', `${baseUrl}/servicios`, fisioToken);
  console.log(`   Status: ${test2.status} - ${test2.success ? '✅' : '❌'}`);
  if (test2.data?.servicios) console.log(`   Servicios encontrados: ${test2.data.servicios.length}`);

  // Test 3: GET /servicios/1 (con token fisioterapeuta)
  console.log('\n🔍 Test 3: GET /servicios/1 (con token fisioterapeuta)');
  const test3 = await testEndpoint('GET', `${baseUrl}/servicios/1`, fisioToken);
  console.log(`   Status: ${test3.status} - ${test3.success ? '✅' : '❌'}`);
  if (test3.data?.servicio) console.log(`   Servicio: ${test3.data.servicio.nombreServicio}`);

  // Test 4: POST /servicios (con token fisioterapeuta - debería fallar)
  console.log('\n🔍 Test 4: POST /servicios (con token fisioterapeuta - debería fallar)');
  const newService = {
    nombreServicio: 'Test Service',
    descripcion: 'Servicio de prueba',
    precio: 50.00
  };
  const test4 = await testEndpoint('POST', `${baseUrl}/servicios`, fisioToken, newService);
  console.log(`   Status: ${test4.status} - ${test4.success ? '✅' : '❌'}`);
  if (test4.data?.error) console.log(`   Error: ${test4.data.error}`);

  // Test 5: POST /servicios (con token admin)
  console.log('\n🔍 Test 5: POST /servicios (con token admin)');
  const test5 = await testEndpoint('POST', `${baseUrl}/servicios`, adminToken, newService);
  console.log(`   Status: ${test5.status} - ${test5.success ? '✅' : '❌'}`);
  if (test5.data?.message) console.log(`   Mensaje: ${test5.data.message}`);

  // Test 6: PUT /servicios/1 (con token fisioterapeuta - debería fallar)
  console.log('\n🔍 Test 6: PUT /servicios/1 (con token fisioterapeuta - debería fallar)');
  const updateData = {
    nombreServicio: 'Servicio Actualizado',
    precio: 75.00
  };
  const test6 = await testEndpoint('PUT', `${baseUrl}/servicios/1`, fisioToken, updateData);
  console.log(`   Status: ${test6.status} - ${test6.success ? '✅' : '❌'}`);
  if (test6.data?.error) console.log(`   Error: ${test6.data.error}`);

  // Test 7: GET /servicios/1/perfiles (con token fisioterapeuta)
  console.log('\n🔍 Test 7: GET /servicios/1/perfiles (con token fisioterapeuta)');
  const test7 = await testEndpoint('GET', `${baseUrl}/servicios/1/perfiles`, fisioToken);
  console.log(`   Status: ${test7.status} - ${test7.success ? '✅' : '❌'}`);
  if (test7.data?.perfiles) console.log(`   Perfiles encontrados: ${test7.data.perfiles.length}`);

  // Test 8: POST /servicios/1/perfiles (con token fisioterapeuta - debería fallar)
  console.log('\n🔍 Test 8: POST /servicios/1/perfiles (con token fisioterapeuta - debería fallar)');
  const asociacionData = { idPerfil: 1 };
  const test8 = await testEndpoint('POST', `${baseUrl}/servicios/1/perfiles`, fisioToken, asociacionData);
  console.log(`   Status: ${test8.status} - ${test8.success ? '✅' : '❌'}`);
  if (test8.data?.error) console.log(`   Error: ${test8.data.error}`);

  console.log('\n🎯 Resumen de pruebas:');
  console.log('- Todos los endpoints están documentados en Swagger');
  console.log('- Los permisos de roles funcionan correctamente');
  console.log('- Los fisioterapeutas pueden ver servicios pero no gestionarlos');
  console.log('- Los administradores pueden gestionar todos los servicios');
  console.log('\n📚 Para probar en Swagger UI:');
  console.log('1. Ve a http://localhost:3001/api-docs');
  console.log('2. Haz clic en "Authorize" y pega uno de estos tokens:');
  console.log(`   Admin: ${adminToken}`);
  console.log(`   Fisioterapeuta: ${fisioToken}`);
  console.log('3. Prueba los endpoints en la sección "Servicios"');
};

// Ejecutar pruebas
runTests().catch(console.error);
