#!/usr/bin/env node

/**
 * Script de prueba para la API de archivos
 * Prueba todos los endpoints del sistema de gestión de archivos
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3001/api';
const TEST_USER = {
  correoElectronico: 'admin@clinica.com',
  contrasena: 'admin123'
};

let authToken = null;

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer login y obtener token
async function login() {
  try {
    log('🔐 Iniciando sesión...', 'blue');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    });
    
    if (!response.ok) {
      throw new Error(`Error en login: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    authToken = data.token;
    
    log('✅ Login exitoso', 'green');
    return true;
  } catch (error) {
    log(`❌ Error en login: ${error.message}`, 'red');
    return false;
  }
}

// Función para hacer requests autenticados
async function authenticatedRequest(url, options = {}) {
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    ...options.headers
  };
  
  return fetch(url, { ...options, headers });
}

// Función para crear un archivo de prueba
function createTestFile() {
  const testContent = 'Este es un archivo de prueba para la API de archivos.\nFecha: ' + new Date().toISOString();
  const testFilePath = path.join(__dirname, 'test-file.txt');
  
  fs.writeFileSync(testFilePath, testContent);
  return testFilePath;
}

// Función para limpiar archivos de prueba
function cleanupTestFiles() {
  const testFilePath = path.join(__dirname, 'test-file.txt');
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }
}

// Prueba 1: Listar archivos (debería estar vacío inicialmente)
async function testListFiles() {
  try {
    log('\n📋 Probando listado de archivos...', 'blue');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Listado exitoso - Total archivos: ${data.pagination.total}`, 'green');
    return data;
  } catch (error) {
    log(`❌ Error en listado: ${error.message}`, 'red');
    return null;
  }
}

// Prueba 2: Subir archivo
async function testUploadFile() {
  try {
    log('\n📤 Probando subida de archivo...', 'blue');
    
    const testFilePath = createTestFile();
    const formData = new FormData();
    formData.append('files', fs.createReadStream(testFilePath));
    formData.append('categoria', 'prueba');
    formData.append('descripcion', 'Archivo de prueba para la API');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Subida exitosa - Archivos subidos: ${data.data.length}`, 'green');
    
    // Limpiar archivo de prueba
    cleanupTestFiles();
    
    return data.data[0]; // Retornar el primer archivo subido
  } catch (error) {
    log(`❌ Error en subida: ${error.message}`, 'red');
    return null;
  }
}

// Prueba 3: Obtener información de archivo
async function testGetFileInfo(fileId) {
  try {
    log('\n📄 Probando obtención de información de archivo...', 'blue');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/${fileId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Información obtenida - Archivo: ${data.data.nombreOriginal}`, 'green');
    return data.data;
  } catch (error) {
    log(`❌ Error obteniendo información: ${error.message}`, 'red');
    return null;
  }
}

// Prueba 4: Actualizar metadata
async function testUpdateFile(fileId) {
  try {
    log('\n✏️ Probando actualización de metadata...', 'blue');
    
    const updateData = {
      descripcion: 'Archivo de prueba actualizado',
      categoria: 'actualizado',
      etiquetas: 'prueba,test,actualizado',
      esPublico: false
    };
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Actualización exitosa - Nueva descripción: ${data.data.descripcion}`, 'green');
    return data.data;
  } catch (error) {
    log(`❌ Error actualizando: ${error.message}`, 'red');
    return null;
  }
}

// Prueba 5: Obtener categorías
async function testGetCategories() {
  try {
    log('\n🏷️ Probando obtención de categorías...', 'blue');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/categories`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Categorías obtenidas: ${data.data.join(', ')}`, 'green');
    return data.data;
  } catch (error) {
    log(`❌ Error obteniendo categorías: ${error.message}`, 'red');
    return null;
  }
}

// Prueba 6: Descargar archivo
async function testDownloadFile(fileId) {
  try {
    log('\n⬇️ Probando descarga de archivo...', 'blue');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/${fileId}/download`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    log(`✅ Descarga exitosa - Tamaño: ${contentLength} bytes, Tipo: ${contentType}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error descargando: ${error.message}`, 'red');
    return false;
  }
}

// Prueba 7: Eliminar archivo
async function testDeleteFile(fileId) {
  try {
    log('\n🗑️ Probando eliminación de archivo...', 'blue');
    
    const response = await authenticatedRequest(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`✅ Eliminación exitosa - ${data.message}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error eliminando: ${error.message}`, 'red');
    return false;
  }
}

// Función principal
async function runTests() {
  log('🚀 Iniciando pruebas de la API de archivos...', 'bright');
  
  // Verificar que el servidor esté ejecutándose
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (!healthResponse.ok) {
      throw new Error('Servidor no disponible');
    }
    log('✅ Servidor disponible', 'green');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3001', 'yellow');
    process.exit(1);
  }
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('❌ No se pudo autenticar. Verifica las credenciales de prueba.', 'red');
    process.exit(1);
  }
  
  // Ejecutar pruebas
  const results = {
    listFiles: await testListFiles(),
    uploadFile: await testUploadFile(),
    getFileInfo: null,
    updateFile: null,
    getCategories: await testGetCategories(),
    downloadFile: null,
    deleteFile: null
  };
  
  // Si se subió un archivo, probar las operaciones con él
  if (results.uploadFile) {
    const fileId = results.uploadFile.idArchivo;
    
    results.getFileInfo = await testGetFileInfo(fileId);
    results.updateFile = await testUpdateFile(fileId);
    results.downloadFile = await testDownloadFile(fileId);
    results.deleteFile = await testDeleteFile(fileId);
  }
  
  // Resumen de resultados
  log('\n📊 Resumen de pruebas:', 'bright');
  log(`✅ Listado de archivos: ${results.listFiles ? 'PASÓ' : 'FALLÓ'}`, results.listFiles ? 'green' : 'red');
  log(`✅ Subida de archivo: ${results.uploadFile ? 'PASÓ' : 'FALLÓ'}`, results.uploadFile ? 'green' : 'red');
  log(`✅ Información de archivo: ${results.getFileInfo ? 'PASÓ' : 'FALLÓ'}`, results.getFileInfo ? 'green' : 'red');
  log(`✅ Actualización de archivo: ${results.updateFile ? 'PASÓ' : 'FALLÓ'}`, results.updateFile ? 'green' : 'red');
  log(`✅ Categorías: ${results.getCategories ? 'PASÓ' : 'FALLÓ'}`, results.getCategories ? 'green' : 'red');
  log(`✅ Descarga de archivo: ${results.downloadFile ? 'PASÓ' : 'FALLÓ'}`, results.downloadFile ? 'green' : 'red');
  log(`✅ Eliminación de archivo: ${results.deleteFile ? 'PASÓ' : 'FALLÓ'}`, results.deleteFile ? 'green' : 'red');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Resultado final: ${passedTests}/${totalTests} pruebas pasaron`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 ¡Todas las pruebas pasaron! El sistema de archivos está funcionando correctamente.', 'green');
  } else {
    log('⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.', 'yellow');
  }
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}
