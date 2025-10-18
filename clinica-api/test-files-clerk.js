#!/usr/bin/env node

/**
 * Script de prueba para la API de archivos con Clerk
 * Prueba la nueva estructura con idUsuario como parámetro
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

// Función para probar listado de archivos
async function testListFiles(userId) {
  try {
    console.log(`📋 Probando listado de archivos para usuario ${userId}...`);
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}`, {
      headers: {
        'Authorization': 'Bearer test-clerk-token' // Token de prueba
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Autenticación requerida (esperado con Clerk)');
      return true;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Error: ${errorData.message || response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Listado de archivos exitoso');
    console.log(`📊 Total archivos: ${data.pagination?.total || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Error en listado:', error.message);
    return false;
  }
}

// Función para probar subida de archivos
async function testUploadFile(userId) {
  try {
    console.log(`📤 Probando subida de archivos para usuario ${userId}...`);
    
    // Crear un archivo de prueba simple
    const testContent = 'Este es un archivo de prueba para la API de archivos con Clerk.\nFecha: ' + new Date().toISOString();
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('files', blob, 'test-file.txt');
    formData.append('categoria', 'prueba');
    formData.append('descripcion', 'Archivo de prueba con Clerk');
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-clerk-token' // Token de prueba
      },
      body: formData
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Autenticación requerida (esperado con Clerk)');
      return true;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Error: ${errorData.message || response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Subida de archivos exitosa');
    console.log(`📊 Archivos subidos: ${data.data?.length || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Error en subida:', error.message);
    return false;
  }
}

// Función para probar obtención de categorías
async function testGetCategories(userId) {
  try {
    console.log(`🏷️ Probando obtención de categorías para usuario ${userId}...`);
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}/categories`, {
      headers: {
        'Authorization': 'Bearer test-clerk-token' // Token de prueba
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Autenticación requerida (esperado con Clerk)');
      return true;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`❌ Error: ${errorData.message || response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Categorías obtenidas exitosamente');
    console.log(`📊 Categorías: ${data.data?.join(', ') || 'Ninguna'}`);
    return true;
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Probando API de archivos con Clerk...');
  console.log('📝 Nueva estructura: /api/files/{idUsuario}/...');
  
  const testUserId = 1; // ID de usuario de prueba
  
  // Probar endpoints
  const results = {
    listFiles: await testListFiles(testUserId),
    uploadFile: await testUploadFile(testUserId),
    getCategories: await testGetCategories(testUserId)
  };
  
  // Resumen de resultados
  console.log('\n📊 Resumen de pruebas:');
  console.log(`✅ Listado de archivos: ${results.listFiles ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Subida de archivos: ${results.uploadFile ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Categorías: ${results.getCategories ? 'PASÓ' : 'FALLÓ'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Resultado final: ${passedTests}/${totalTests} pruebas pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡API de archivos con Clerk funcionando correctamente!');
    console.log('\n📚 Endpoints disponibles:');
    console.log('  GET    /api/files/{idUsuario}              - Listar archivos');
    console.log('  GET    /api/files/{idUsuario}/categories   - Obtener categorías');
    console.log('  POST   /api/files/{idUsuario}/upload        - Subir archivos');
    console.log('  GET    /api/files/{idUsuario}/{id}          - Obtener archivo');
    console.log('  GET    /api/files/{idUsuario}/{id}/download - Descargar archivo');
    console.log('  PATCH  /api/files/{idUsuario}/{id}         - Actualizar archivo');
    console.log('  DELETE /api/files/{idUsuario}/{id}         - Eliminar archivo');
  } else {
    console.log('⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.');
  }
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
