/**
 * TEST: Verificar que los archivos se suban al directorio correcto del usuario
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
      ...options.headers
    }
  });
  return response;
};

// Función para crear un archivo de prueba
const crearArchivoPrueba = (nombreArchivo) => {
  const contenido = `Archivo de prueba para usuario ${ID_USUARIO}
Creado el: ${new Date().toISOString()}
Este archivo debería guardarse en: uploads/user_${ID_USUARIO}/`;

  const rutaArchivo = path.join(__dirname, nombreArchivo);
  fs.writeFileSync(rutaArchivo, contenido);
  
  console.log('✅ Archivo de prueba creado:', rutaArchivo);
  return rutaArchivo;
};

// Función para subir archivo
const subirArchivo = async (rutaArchivo) => {
  console.log(`📤 Subiendo archivo para usuario ${ID_USUARIO}...`);
  
  const formData = new FormData();
  const archivo = fs.createReadStream(rutaArchivo);
  formData.append('files', archivo, path.basename(rutaArchivo));
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
  console.log('✅ Archivo subido exitosamente');
  console.log('   - ID del archivo:', data.data[0].idArchivo);
  console.log('   - Ruta en BD:', data.data[0].rutaArchivo);
  console.log('   - Nombre original:', data.data[0].nombreOriginal);
  
  return data.data[0];
};

// Función para verificar la estructura de directorios
const verificarEstructuraDirectorios = () => {
  console.log('🔍 Verificando estructura de directorios...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Directorio uploads no existe');
    return false;
  }
  
  console.log('✅ Directorio uploads existe');
  
  // Verificar directorio del usuario
  const userDir = path.join(uploadsDir, `user_${ID_USUARIO}`);
  
  if (!fs.existsSync(userDir)) {
    console.log(`❌ Directorio user_${ID_USUARIO} no existe`);
    return false;
  }
  
  console.log(`✅ Directorio user_${ID_USUARIO} existe`);
  
  // Listar archivos en el directorio del usuario
  const archivos = fs.readdirSync(userDir);
  console.log(`📁 Archivos en user_${ID_USUARIO}:`, archivos);
  
  return true;
};

// Función para verificar que el archivo se guardó correctamente
const verificarArchivoGuardado = (archivoInfo) => {
  console.log('🔍 Verificando que el archivo se guardó correctamente...');
  
  const rutaCompleta = path.join(__dirname, 'uploads', archivoInfo.rutaArchivo);
  
  if (!fs.existsSync(rutaCompleta)) {
    console.log('❌ El archivo no existe en la ruta esperada:', rutaCompleta);
    return false;
  }
  
  console.log('✅ El archivo existe en la ruta correcta');
  console.log('   - Ruta completa:', rutaCompleta);
  
  // Verificar que está en el directorio del usuario correcto
  if (!rutaCompleta.includes(`user_${ID_USUARIO}`)) {
    console.log('❌ El archivo no está en el directorio del usuario correcto');
    return false;
  }
  
  console.log('✅ El archivo está en el directorio correcto del usuario');
  
  return true;
};

// Función para limpiar archivos de prueba
const limpiarArchivos = (rutaArchivo) => {
  console.log('🧹 Limpiando archivos de prueba...');
  
  if (fs.existsSync(rutaArchivo)) {
    fs.unlinkSync(rutaArchivo);
    console.log('✅ Archivo de prueba eliminado');
  }
};

// Función principal
const ejecutarPrueba = async () => {
  console.log('🚀 Iniciando prueba de subida de archivos por usuario...\n');
  
  let rutaArchivo = null;
  let archivoSubido = null;
  
  try {
    // 1. Verificar estructura inicial
    console.log('📋 PASO 1: Verificar estructura de directorios');
    verificarEstructuraDirectorios();
    
    // 2. Crear archivo de prueba
    console.log('\n📋 PASO 2: Crear archivo de prueba');
    rutaArchivo = crearArchivoPrueba(`test-usuario-${ID_USUARIO}.txt`);
    
    // 3. Subir archivo
    console.log('\n📋 PASO 3: Subir archivo');
    archivoSubido = await subirArchivo(rutaArchivo);
    
    // 4. Verificar que se guardó correctamente
    console.log('\n📋 PASO 4: Verificar archivo guardado');
    const archivoCorrecto = verificarArchivoGuardado(archivoSubido);
    
    // 5. Verificar estructura final
    console.log('\n📋 PASO 5: Verificar estructura final');
    verificarEstructuraDirectorios();
    
    // 6. Mostrar resumen
    console.log('\n📊 RESUMEN DE LA PRUEBA:');
    if (archivoCorrecto) {
      console.log('✅ ÉXITO: El archivo se guardó en el directorio correcto del usuario');
      console.log(`   - Usuario: ${ID_USUARIO}`);
      console.log(`   - Directorio: uploads/user_${ID_USUARIO}/`);
      console.log(`   - Archivo: ${archivoSubido.nombreArchivo}`);
    } else {
      console.log('❌ FALLO: El archivo no se guardó correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  } finally {
    // Limpiar archivos
    if (rutaArchivo) {
      limpiarArchivos(rutaArchivo);
    }
  }
};

// Ejecutar prueba
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPrueba();
}

export {
  ejecutarPrueba,
  verificarEstructuraDirectorios,
  verificarArchivoGuardado
};
