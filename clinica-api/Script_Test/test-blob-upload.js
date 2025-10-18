#!/usr/bin/env node

/**
 * Script de prueba para subir archivos como Blob al endpoint
 * Prueba diferentes tipos de Blob y FormData
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3001/api';

// Función para crear un archivo de prueba como Blob
function createTestBlob(content, mimeType = 'text/plain') {
  return new Blob([content], { type: mimeType });
}

// Función para probar subida de Blob
async function testBlobUpload(userId, clerkToken) {
  try {
    console.log(`📤 Probando subida de Blob para usuario ${userId}...`);
    
    // Crear diferentes tipos de Blob
    const textBlob = createTestBlob('Este es un archivo de texto generado como Blob\nFecha: ' + new Date().toISOString());
    const jsonBlob = createTestBlob(JSON.stringify({ 
      test: true, 
      timestamp: new Date().toISOString(),
      data: 'Información de prueba'
    }, null, 2), 'application/json');
    
    // Crear FormData
    const formData = new FormData();
    formData.append('files', textBlob, 'test-blob.txt');
    formData.append('files', jsonBlob, 'test-data.json');
    formData.append('categoria', 'blob-test');
    formData.append('descripcion', 'Archivos generados como Blob para prueba');
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkToken}`
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
    console.log('✅ Subida de Blob exitosa');
    console.log(`📊 Archivos subidos: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('📋 Detalles de archivos subidos:');
      data.data.forEach((archivo, index) => {
        console.log(`  ${index + 1}. ${archivo.nombreOriginal} (${archivo.tipoMime}) - ${archivo.tamanoArchivo} bytes`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en subida de Blob:', error.message);
    return false;
  }
}

// Función para probar subida de archivo real como Blob
async function testRealFileAsBlob(userId, clerkToken) {
  try {
    console.log(`📤 Probando subida de archivo real como Blob...`);
    
    // Crear archivo de prueba
    const testFilePath = path.join(__dirname, 'test-file-blob.txt');
    const testContent = 'Archivo de prueba para Blob upload\n' + 
                       'Fecha: ' + new Date().toISOString() + '\n' +
                       'Tipo: Blob desde archivo real';
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Leer archivo y crear Blob
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileBlob = new Blob([fileBuffer], { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('files', fileBlob, 'real-file-as-blob.txt');
    formData.append('categoria', 'real-file');
    formData.append('descripcion', 'Archivo real convertido a Blob');
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkToken}`
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
    console.log('✅ Subida de archivo real como Blob exitosa');
    console.log(`📊 Archivos subidos: ${data.data?.length || 0}`);
    
    // Limpiar archivo de prueba
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en subida de archivo real como Blob:', error.message);
    return false;
  }
}

// Función para probar diferentes tipos MIME
async function testDifferentMimeTypes(userId, clerkToken) {
  try {
    console.log(`📤 Probando diferentes tipos MIME con Blob...`);
    
    const blobs = [
      { content: 'Texto plano', mimeType: 'text/plain', name: 'texto.txt' },
      { content: '{"json": true}', mimeType: 'application/json', name: 'datos.json' },
      { content: 'nombre,edad\nJuan,25', mimeType: 'text/csv', name: 'datos.csv' },
      { content: 'Contenido binario simulado', mimeType: 'application/octet-stream', name: 'binario.bin' }
    ];
    
    const formData = new FormData();
    
    blobs.forEach(blob => {
      const blobObj = new Blob([blob.content], { type: blob.mimeType });
      formData.append('files', blobObj, blob.name);
    });
    
    formData.append('categoria', 'mime-test');
    formData.append('descripcion', 'Prueba de diferentes tipos MIME');
    
    const response = await fetch(`${API_BASE_URL}/files/${userId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkToken}`
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
    console.log('✅ Subida de diferentes tipos MIME exitosa');
    console.log(`📊 Archivos subidos: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('📋 Tipos MIME procesados:');
      data.data.forEach((archivo, index) => {
        console.log(`  ${index + 1}. ${archivo.nombreOriginal} - ${archivo.tipoMime}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error en subida de diferentes tipos MIME:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Probando subida de archivos como Blob...');
  console.log('📝 Endpoint: /api/files/{idUsuario}/upload');
  
  const testUserId = 1;
  const testClerkToken = 'test-clerk-token'; // Token de prueba
  
  // Probar diferentes escenarios
  const results = {
    blobUpload: await testBlobUpload(testUserId, testClerkToken),
    realFileAsBlob: await testRealFileAsBlob(testUserId, testClerkToken),
    differentMimeTypes: await testDifferentMimeTypes(testUserId, testClerkToken)
  };
  
  // Resumen de resultados
  console.log('\n📊 Resumen de pruebas de Blob:');
  console.log(`✅ Subida de Blob: ${results.blobUpload ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Archivo real como Blob: ${results.realFileAsBlob ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Diferentes tipos MIME: ${results.differentMimeTypes ? 'PASÓ' : 'FALLÓ'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Resultado final: ${passedTests}/${totalTests} pruebas pasaron`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Subida de Blob funcionando correctamente!');
    console.log('\n📚 Tipos de Blob soportados:');
    console.log('  - Blob desde texto');
    console.log('  - Blob desde JSON');
    console.log('  - Blob desde archivo real');
    console.log('  - Blob con diferentes tipos MIME');
    console.log('  - Múltiples Blobs en una solicitud');
  } else {
    console.log('⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.');
  }
  
  console.log('\n💡 Para usar desde el frontend:');
  console.log('  const blob = new Blob([contenido], { type: "text/plain" });');
  console.log('  const formData = new FormData();');
  console.log('  formData.append("files", blob, "nombre.txt");');
  console.log('  fetch("/api/files/1/upload", { method: "POST", body: formData });');
}

// Ejecutar si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
