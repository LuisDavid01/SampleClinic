# Guía: Cómo Servir Archivos desde el Frontend

## 📋 Resumen

Este documento explica cómo usar el endpoint `GET /api/files/{idUsuario}/{id}/serve` para mostrar archivos en el navegador desde tu aplicación Next.js.

## 🚀 Endpoints Disponibles

### 1. **Servir Archivo (Visualización)**
```
GET /api/files/{idUsuario}/{id}/serve
```
- **Propósito**: Mostrar archivos en el navegador (inline)
- **Autenticación**: Requiere token de Clerk
- **Características**: Soporta streaming, cache, y diferentes tipos de archivo

### 2. **Descargar Archivo**
```
GET /api/files/{idUsuario}/{id}/download
```
- **Propósito**: Forzar descarga del archivo
- **Autenticación**: Requiere token de Clerk
- **Características**: Headers de descarga, nombre de archivo original

## 🔧 Implementación en React/Next.js

### 1. **Componente Básico para Mostrar Archivos**

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const VisorArchivos = ({ idUsuario }) => {
  const { getToken } = useAuth();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarArchivos = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`/api/files/${idUsuario}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        setArchivos(data.data);
      } catch (error) {
        console.error('Error cargando archivos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarArchivos();
  }, [idUsuario, getToken]);

  // Función para obtener URL del archivo
  const obtenerUrlArchivo = (idArchivo) => {
    return `/api/files/${idUsuario}/${idArchivo}/serve`;
  };

  if (loading) return <div>Cargando archivos...</div>;

  return (
    <div className="archivos-grid">
      {archivos.map((archivo) => (
        <div key={archivo.idArchivo} className="archivo-card">
          <h3>{archivo.nombreOriginal}</h3>
          
          {/* Mostrar imagen */}
          {archivo.tipoMime.startsWith('image/') && (
            <img 
              src={obtenerUrlArchivo(archivo.idArchivo)}
              alt={archivo.nombreOriginal}
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          )}
          
          {/* Mostrar PDF */}
          {archivo.tipoMime === 'application/pdf' && (
            <iframe
              src={obtenerUrlArchivo(archivo.idArchivo)}
              width="100%"
              height="400px"
              title={archivo.nombreOriginal}
            />
          )}
          
          {/* Mostrar video */}
          {archivo.tipoMime.startsWith('video/') && (
            <video
              src={obtenerUrlArchivo(archivo.idArchivo)}
              controls
              width="100%"
              height="300px"
            >
              Tu navegador no soporta el elemento video.
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default VisorArchivos;
```

### 2. **Hook Personalizado para Archivos**

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export const useArchivos = (idUsuario) => {
  const { getToken } = useAuth();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarArchivos = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const params = new URLSearchParams(filtros);
      const response = await fetch(`/api/files/${idUsuario}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error cargando archivos');
      
      const data = await response.json();
      setArchivos(data.data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const subirArchivos = async (archivos, metadata = {}) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      
      archivos.forEach(archivo => {
        formData.append('files', archivo);
      });
      
      if (metadata.expedienteId) {
        formData.append('expedienteId', metadata.expedienteId);
      }
      if (metadata.categoria) {
        formData.append('categoria', metadata.categoria);
      }
      
      const response = await fetch(`/api/files/${idUsuario}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) throw new Error('Error subiendo archivos');
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    archivos,
    loading,
    error,
    cargarArchivos,
    subirArchivos
  };
};
```

### 3. **Página Principal con Archivos**

```jsx
import React from 'react';
import { useAuth } from '@clerk/nextjs';
import VisorArchivos from '../components/VisorArchivos';

const ArchivosPage = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Debes estar autenticado para ver archivos</div>;
  }

  // Obtener ID de usuario desde Clerk
  const idUsuario = user.publicMetadata?.idUsuario || 1;

  return (
    <div className="archivos-page">
      <h1>Gestor de Archivos</h1>
      <VisorArchivos idUsuario={idUsuario} />
    </div>
  );
};

export default ArchivosPage;
```

## 🎨 Estilos CSS

```css
.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.archivo-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.archivo-card img {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.archivo-card iframe {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.archivo-card video {
  border-radius: 4px;
}
```

## 🔧 Configuración de Next.js

### 1. **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. **Variables de Entorno (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_key_aqui
```

## 📱 Casos de Uso

### 1. **Mostrar Imágenes**
```jsx
// Para mostrar una imagen
<img 
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  alt="Descripción de la imagen"
  style={{ maxWidth: '100%', height: 'auto' }}
/>
```

### 2. **Mostrar PDFs**
```jsx
// Para mostrar un PDF
<iframe
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  width="100%"
  height="600px"
  title="Documento PDF"
/>
```

### 3. **Mostrar Videos**
```jsx
// Para mostrar un video
<video
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  controls
  width="100%"
  height="400px"
>
  Tu navegador no soporta el elemento video.
</video>
```

### 4. **Descargar Archivos**
```jsx
const descargarArchivo = async (idArchivo, nombreArchivo) => {
  try {
    const token = await getToken();
    const response = await fetch(`/api/files/${idUsuario}/${idArchivo}/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error descargando archivo');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error descargando archivo:', error);
  }
};
```

## 🧪 Pruebas

### 1. **Probar desde Postman**
```bash
# Listar archivos
GET http://localhost:3001/api/files/1
Authorization: Bearer tu_token_clerk

# Servir archivo
GET http://localhost:3001/api/files/1/1/serve
Authorization: Bearer tu_token_clerk

# Descargar archivo
GET http://localhost:3001/api/files/1/1/download
Authorization: Bearer tu_token_clerk
```

### 2. **Probar desde Navegador**
```bash
# Abrir en navegador (requiere autenticación)
http://localhost:3001/api/files/1/1/serve
```

## 🔒 Seguridad

### 1. **Autenticación Requerida**
- Todos los endpoints requieren token de Clerk
- El token se valida en cada petición
- Solo el propietario puede acceder a sus archivos

### 2. **Validación de Archivos**
- Verificación de existencia del archivo
- Validación de permisos de usuario
- Headers de seguridad apropiados

### 3. **Límites de Tamaño**
- Máximo 10MB por archivo
- Máximo 5 archivos por petición
- Streaming para archivos grandes

## 🚀 Características Avanzadas

### 1. **Streaming de Archivos**
- Soporte para archivos grandes
- Headers de rango (Range requests)
- Carga progresiva de contenido

### 2. **Cache de Archivos**
- Headers de cache apropiados
- Cache por 1 hora por defecto
- Optimización de rendimiento

### 3. **Tipos de Archivo Soportados**
- Imágenes: JPG, PNG, GIF, WebP
- Documentos: PDF, DOC, DOCX
- Videos: MP4, WebM, AVI
- Audio: MP3, WAV, OGG
- Otros: TXT, CSV, JSON

## 📊 Monitoreo y Logs

### 1. **Logs del Servidor**
```javascript
// Los logs se muestran en la consola del servidor
console.log('Archivo servido:', archivo.nombreOriginal);
console.log('Tamaño:', archivo.tamanoArchivo);
console.log('Tipo:', archivo.tipoMime);
```

### 2. **Métricas de Uso**
- Número de archivos servidos
- Tamaño total de archivos
- Tipos de archivo más comunes
- Errores de acceso

## 🎯 Mejores Prácticas

### 1. **Optimización de Imágenes**
- Usar formatos modernos (WebP, AVIF)
- Redimensionar imágenes grandes
- Implementar lazy loading

### 2. **Gestión de Archivos**
- Limpiar archivos no utilizados
- Implementar compresión
- Usar CDN para archivos estáticos

### 3. **Experiencia de Usuario**
- Mostrar indicadores de carga
- Manejar errores gracefully
- Implementar previews rápidos

## 🔧 Solución de Problemas

### 1. **Error 401 (No Autorizado)**
- Verificar que el token de Clerk sea válido
- Comprobar que el usuario tenga permisos
- Revisar la configuración de autenticación

### 2. **Error 404 (Archivo No Encontrado)**
- Verificar que el archivo existe en la base de datos
- Comprobar que el archivo físico existe
- Revisar la ruta del archivo

### 3. **Error 500 (Error Interno)**
- Revisar los logs del servidor
- Verificar la configuración de la base de datos
- Comprobar los permisos del sistema de archivos

## 📚 Recursos Adicionales

- [Documentación de Clerk](https://clerk.com/docs)
- [Guía de Next.js](https://nextjs.org/docs)
- [Documentación de React](https://react.dev)
- [Guía de Multer](https://github.com/expressjs/multer)

---

¡Con esta guía puedes implementar un sistema completo de gestión de archivos en tu aplicación Next.js! 🚀
