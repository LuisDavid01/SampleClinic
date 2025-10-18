/**
 * SCRIPT: Verificar la estructura de directorios de uploads
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');

console.log('🔍 Verificando estructura de directorios de uploads...\n');

// Verificar si existe el directorio uploads
if (!fs.existsSync(uploadsDir)) {
  console.log('❌ El directorio uploads no existe');
  console.log('   Ruta esperada:', uploadsDir);
  process.exit(1);
}

console.log('✅ Directorio uploads existe');
console.log('   Ruta:', uploadsDir);

// Listar todos los directorios y archivos
const listarDirectorio = (dir, nivel = 0) => {
  const indent = '  '.repeat(nivel);
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        console.log(`${indent}📁 ${item}/`);
        listarDirectorio(itemPath, nivel + 1);
      } else {
        const size = (stats.size / 1024).toFixed(2);
        console.log(`${indent}📄 ${item} (${size} KB)`);
      }
    }
  } catch (error) {
    console.log(`${indent}❌ Error leyendo directorio: ${error.message}`);
  }
};

console.log('\n📋 Estructura actual:');
listarDirectorio(uploadsDir);

// Verificar directorios de usuarios específicos
console.log('\n👥 Verificando directorios de usuarios:');

const usuariosEncontrados = [];
const items = fs.readdirSync(uploadsDir);

for (const item of items) {
  if (item.startsWith('user_')) {
    const userId = item.replace('user_', '');
    usuariosEncontrados.push(userId);
    
    const userDir = path.join(uploadsDir, item);
    const archivos = fs.readdirSync(userDir);
    
    console.log(`   📁 user_${userId}/ (${archivos.length} archivos)`);
    
    // Mostrar algunos archivos como ejemplo
    if (archivos.length > 0) {
      const ejemplos = archivos.slice(0, 3);
      for (const archivo of ejemplos) {
        const archivoPath = path.join(userDir, archivo);
        const stats = fs.statSync(archivoPath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`      📄 ${archivo} (${size} KB)`);
      }
      
      if (archivos.length > 3) {
        console.log(`      ... y ${archivos.length - 3} archivos más`);
      }
    }
  }
}

if (usuariosEncontrados.length === 0) {
  console.log('   ❌ No se encontraron directorios de usuarios');
} else {
  console.log(`\n✅ Se encontraron ${usuariosEncontrados.length} directorios de usuarios:`);
  usuariosEncontrados.forEach(userId => {
    console.log(`   - user_${userId}`);
  });
}

// Verificar si hay archivos en el directorio raíz
const archivosEnRaiz = items.filter(item => {
  const itemPath = path.join(uploadsDir, item);
  return fs.statSync(itemPath).isFile();
});

if (archivosEnRaiz.length > 0) {
  console.log('\n⚠️  ADVERTENCIA: Se encontraron archivos en el directorio raíz:');
  archivosEnRaiz.forEach(archivo => {
    const archivoPath = path.join(uploadsDir, archivo);
    const stats = fs.statSync(archivoPath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   📄 ${archivo} (${size} KB)`);
  });
  console.log('   Estos archivos deberían estar en directorios de usuarios específicos.');
}

console.log('\n📊 Resumen:');
console.log(`   - Directorio uploads: ${uploadsDir}`);
console.log(`   - Usuarios encontrados: ${usuariosEncontrados.length}`);
console.log(`   - Archivos en raíz: ${archivosEnRaiz.length}`);

if (usuariosEncontrados.length > 0) {
  console.log('\n💡 Recomendaciones:');
  console.log('   - Los archivos se están guardando correctamente en directorios de usuarios');
  console.log('   - Cada usuario tiene su propio directorio: user_{idUsuario}');
} else {
  console.log('\n💡 Recomendaciones:');
  console.log('   - No hay archivos de usuarios aún');
  console.log('   - Los nuevos archivos se guardarán en directorios user_{idUsuario}');
}
