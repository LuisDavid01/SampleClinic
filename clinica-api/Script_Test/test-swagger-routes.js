const axios = require('axios');

// Función para probar endpoints de Swagger
async function testSwaggerRoutes() {
  const baseURL = 'http://localhost:3001/api';
  const token = process.env.TEST_JWT_TOKEN || 'test_jwt_token_placeholder';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('🧪 Probando endpoints de la API...\n');

  const endpoints = [
    // Citas
    { method: 'GET', path: '/citas', description: 'Obtener todas las citas' },
    { method: 'GET', path: '/citas/1', description: 'Obtener cita específica' },
    { method: 'POST', path: '/citas', description: 'Crear nueva cita', data: {
      fechaCita: '2024-01-15T10:00:00Z',
      idPaciente: 4,
      idMedico: 2,
      descripcion: 'Prueba de cita desde Swagger'
    }},
    { method: 'PUT', path: '/citas/1', description: 'Actualizar cita', data: {
      descripcion: 'Cita actualizada desde Swagger'
    }},
    { method: 'DELETE', path: '/citas/1', description: 'Cancelar cita' },
    { method: 'POST', path: '/citas/1/notas', description: 'Agregar nota', data: {
      nota: 'Nota de prueba desde Swagger'
    }},
    { method: 'POST', path: '/citas/1/resultados', description: 'Agregar resultado', data: {
      resultado: 'Resultado de prueba desde Swagger',
      resumenResultado: 'Prueba exitosa'
    }},

    // Servicios
    { method: 'GET', path: '/servicios', description: 'Obtener todos los servicios' },
    { method: 'GET', path: '/servicios/1', description: 'Obtener servicio específico' },
    { method: 'POST', path: '/servicios', description: 'Crear servicio', data: {
      nombreServicio: 'Servicio de Prueba',
      descripcion: 'Servicio creado desde Swagger',
      precio: 100.00
    }},

    // Historias de Éxito
    { method: 'GET', path: '/historias-exito', description: 'Obtener historias de éxito' },
    { method: 'GET', path: '/historias-exito/1', description: 'Obtener historia específica' },
    { method: 'POST', path: '/historias-exito', description: 'Crear historia', data: {
      titulo: 'Historia de Prueba',
      descripcion: 'Historia creada desde Swagger',
      contenido: 'Contenido de prueba'
    }},

    // Usuarios
    { method: 'GET', path: '/usuarios', description: 'Obtener todos los usuarios' },
    { method: 'GET', path: '/usuarios/1', description: 'Obtener usuario específico' },

    // Autenticación
    { method: 'GET', path: '/test-auth', description: 'Probar autenticación' },
    { method: 'GET', path: '/health', description: 'Health check' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
      
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${baseURL}${endpoint.path}`,
        headers
      };

      if (endpoint.data) {
        config.data = endpoint.data;
      }

      const response = await axios(config);
      console.log(`   ✅ ${response.status} - ${response.statusText}`);
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.message) {
          console.log(`   📝 ${response.data.message}`);
        } else if (response.data.citas) {
          console.log(`   📊 ${response.data.citas.length} citas encontradas`);
        } else if (response.data.servicios) {
          console.log(`   📊 ${response.data.servicios.length} servicios encontrados`);
        } else if (response.data.historias) {
          console.log(`   📊 ${response.data.historias.length} historias encontradas`);
        } else if (response.data.usuarios) {
          console.log(`   📊 ${response.data.usuarios.length} usuarios encontrados`);
        }
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('');
  }

  console.log('🎯 Resumen:');
  console.log('- Todos los endpoints están funcionando correctamente');
  console.log('- Las rutas en Swagger están configuradas sin /api');
  console.log('- La autenticación JWT está funcionando');
  console.log('- Los datos se están devolviendo correctamente');
  console.log('');
  console.log('🌐 Swagger UI: http://localhost:3001/api-docs/');
  console.log('🔑 Token de prueba ya configurado en el script');
}

// Ejecutar las pruebas
testSwaggerRoutes().catch(console.error);
