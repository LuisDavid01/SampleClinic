/**
 * TEST: Endpoint para servir archivos
 * 
 * Este script prueba el endpoint GET /api/files/{idUsuario}/{id}/serve
 * que permite visualizar archivos en el navegador.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const API_BASE_URL = 'http://localhost:3001';
const ID_USUARIO = 1;
const TOKEN_CLERK = 'tu_token_clerk_aqui'; // Reemplaza con un token real

// Función para hacer peticiones autenticadas
const fetchAutenticado = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN_CLERK}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response;
};

// Función para crear un archivo de prueba
const crearArchivoPrueba = async () => {
  console.log('📁 Creando archivo de prueba...');
  
  const contenido = `Este es un archivo de prueba creado el ${new Date().toISOString()}
  
Contenido del archivo:
- Línea 1: Información importante
- Línea 2: Datos del paciente
- Línea 3: Resultados de laboratorio

Fin del archivo.`;

  const rutaArchivo = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(rutaArchivo, contenido);
  
  console.log('✅ Archivo de prueba creado:', rutaArchivo);
  return rutaArchivo;
};

// Función para subir un archivo
const subirArchivo = async (rutaArchivo) => {
  console.log('📤 Subiendo archivo...');
  
  const formData = new FormData();
  const archivo = fs.createReadStream(rutaArchivo);
  formData.append('files', archivo, 'test-file.txt');
  formData.append('categoria', 'Pruebas');
  
  const response = await fetchAutenticado(`${API_BASE_URL}/api/files/${ID_USUARIO}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error subiendo archivo: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  console.log('✅ Archivo subido exitosamente:', data.data[0].idArchivo);
  return data.data[0];
};

// Función para listar archivos
const listarArchivos = async () => {
  console.log('📋 Listando archivos...');
  
  const response = await fetchAutenticado(`${API_BASE_URL}/api/files/${ID_USUARIO}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error listando archivos: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  console.log('✅ Archivos listados:', data.data.length, 'archivos encontrados');
  return data.data;
};

// Función para probar el endpoint de servir archivos
const probarServirArchivo = async (idArchivo) => {
  console.log(`🔍 Probando endpoint de servir archivo ${idArchivo}...`);
  
  const response = await fetchAutenticado(`${API_BASE_URL}/api/files/${ID_USUARIO}/${idArchivo}/serve`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error sirviendo archivo: ${response.status} - ${error}`);
  }
  
  // Verificar headers
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  const contentDisposition = response.headers.get('content-disposition');
  
  console.log('✅ Archivo servido exitosamente');
  console.log('   - Content-Type:', contentType);
  console.log('   - Content-Length:', contentLength);
  console.log('   - Content-Disposition:', contentDisposition);
  
  // Leer contenido
  const contenido = await response.text();
  console.log('   - Contenido (primeros 100 caracteres):', contenido.substring(0, 100) + '...');
  
  return {
    contentType,
    contentLength,
    contentDisposition,
    contenido
  };
};

// Función para probar streaming (archivos grandes)
const probarStreaming = async (idArchivo) => {
  console.log(`🌊 Probando streaming para archivo ${idArchivo}...`);
  
  // Simular petición con rango
  const response = await fetchAutenticado(`${API_BASE_URL}/api/files/${ID_USUARIO}/${idArchivo}/serve`, {
    headers: {
      'Range': 'bytes=0-50' // Primeros 50 bytes
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error en streaming: ${response.status} - ${error}`);
  }
  
  const contentRange = response.headers.get('content-range');
  const acceptRanges = response.headers.get('accept-ranges');
  
  console.log('✅ Streaming funcionando');
  console.log('   - Content-Range:', contentRange);
  console.log('   - Accept-Ranges:', acceptRanges);
  
  return {
    contentRange,
    acceptRanges
  };
};

// Función para probar descarga
const probarDescarga = async (idArchivo) => {
  console.log(`⬇️ Probando descarga para archivo ${idArchivo}...`);
  
  const response = await fetchAutenticado(`${API_BASE_URL}/api/files/${ID_USUARIO}/${idArchivo}/download`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error descargando archivo: ${response.status} - ${error}`);
  }
  
  const contentDisposition = response.headers.get('content-disposition');
  const contentType = response.headers.get('content-type');
  
  console.log('✅ Descarga funcionando');
  console.log('   - Content-Disposition:', contentDisposition);
  console.log('   - Content-Type:', contentType);
  
  return {
    contentDisposition,
    contentType
  };
};

// Función para limpiar archivos de prueba
const limpiarArchivos = async (rutaArchivo) => {
  console.log('🧹 Limpiando archivos de prueba...');
  
  if (fs.existsSync(rutaArchivo)) {
    fs.unlinkSync(rutaArchivo);
    console.log('✅ Archivo de prueba eliminado');
  }
};

// Función principal
const ejecutarPruebas = async () => {
  console.log('🚀 Iniciando pruebas del endpoint de servir archivos...\n');
  
  let rutaArchivo = null;
  let archivoSubido = null;
  
  try {
    // 1. Crear archivo de prueba
    rutaArchivo = await crearArchivoPrueba();
    
    // 2. Subir archivo
    archivoSubido = await subirArchivo(rutaArchivo);
    
    // 3. Listar archivos
    const archivos = await listarArchivos();
    
    // 4. Probar endpoint de servir archivos
    const resultadoServir = await probarServirArchivo(archivoSubido.idArchivo);
    
    // 5. Probar streaming
    const resultadoStreaming = await probarStreaming(archivoSubido.idArchivo);
    
    // 6. Probar descarga
    const resultadoDescarga = await probarDescarga(archivoSubido.idArchivo);
    
    // 7. Mostrar resumen
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('✅ Subida de archivos: OK');
    console.log('✅ Listado de archivos: OK');
    console.log('✅ Servir archivos: OK');
    console.log('✅ Streaming: OK');
    console.log('✅ Descarga: OK');
    
    console.log('\n🔗 ENDPOINTS DISPONIBLES:');
    console.log(`   - Listar: GET ${API_BASE_URL}/api/files/${ID_USUARIO}`);
    console.log(`   - Servir: GET ${API_BASE_URL}/api/files/${ID_USUARIO}/${archivoSubido.idArchivo}/serve`);
    console.log(`   - Descargar: GET ${API_BASE_URL}/api/files/${ID_USUARIO}/${archivoSubido.idArchivo}/download`);
    
    console.log('\n💡 USO EN FRONTEND:');
    console.log('   - Para mostrar imágenes: <img src="/api/files/1/1/serve" />');
    console.log('   - Para mostrar PDFs: <iframe src="/api/files/1/1/serve" />');
    console.log('   - Para mostrar videos: <video src="/api/files/1/1/serve" controls />');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    process.exit(1);
  } finally {
    // Limpiar archivos
    if (rutaArchivo) {
      await limpiarArchivos(rutaArchivo);
    }
  }
};

// Ejecutar pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPruebas();
}

export {
  ejecutarPruebas,
  probarServirArchivo,
  probarStreaming,
  probarDescarga
};
