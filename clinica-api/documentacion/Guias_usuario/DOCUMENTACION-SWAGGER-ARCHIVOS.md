# 📚 Documentación Swagger - API de Archivos

## 🎯 Resumen

Esta documentación explica cómo usar la documentación Swagger para la API de archivos del sistema de clínica fisioterapéutica.

## 🚀 Acceso a Swagger UI

### **URL de Desarrollo**
```
http://localhost:3001/api-docs
```

### **URL de Producción**
```
https://api.stackkub.com/api-docs
```

## 📋 Endpoints Documentados

### **1. Listar Archivos del Usuario**
- **Endpoint**: `GET /api/files/{idUsuario}`
- **Descripción**: Obtiene la lista de archivos con paginación y filtros
- **Parámetros de consulta**:
  - `page`: Número de página (default: 1)
  - `limit`: Elementos por página (default: 10, max: 100)
  - `categoria`: Filtrar por categoría
  - `search`: Buscar en nombre, descripción o etiquetas
  - `expedienteId`: Filtrar por expediente

### **2. Obtener Categorías**
- **Endpoint**: `GET /api/files/{idUsuario}/categories`
- **Descripción**: Obtiene las categorías únicas de archivos del usuario

### **3. Subir Archivos**
- **Endpoint**: `POST /api/files/{idUsuario}/upload`
- **Descripción**: Sube uno o más archivos (máximo 5, 10MB cada uno)
- **Content-Type**: `multipart/form-data`
- **Campos**:
  - `files`: Archivos a subir (requerido)
  - `expedienteId`: ID del expediente (opcional)
  - `categoria`: Categoría del archivo (opcional)

### **4. Obtener Información de Archivo**
- **Endpoint**: `GET /api/files/{idUsuario}/{id}`
- **Descripción**: Obtiene la información completa de un archivo específico

### **5. Descargar Archivo**
- **Endpoint**: `GET /api/files/{idUsuario}/{id}/download`
- **Descripción**: Descarga un archivo como adjunto
- **Headers**: `Content-Disposition: attachment`

### **6. Servir Archivo (Visualización)**
- **Endpoint**: `GET /api/files/{idUsuario}/{id}/serve`
- **Descripción**: Sirve un archivo para visualización inline en el navegador
- **Características**: Streaming, cache, soporte para Range requests

### **7. Actualizar Metadata**
- **Endpoint**: `PATCH /api/files/{idUsuario}/{id}`
- **Descripción**: Actualiza los metadatos de un archivo
- **Campos actualizables**:
  - `descripcion`: Descripción del archivo
  - `categoria`: Categoría para organización
  - `etiquetas`: Etiquetas separadas por comas
  - `esPublico`: Visibilidad pública/privada

### **8. Eliminar Archivo**
- **Endpoint**: `DELETE /api/files/{idUsuario}/{id}`
- **Descripción**: Elimina un archivo (soft delete)

## 🔐 Autenticación

### **Token de Clerk**
Todos los endpoints requieren autenticación con token de Clerk:

```javascript
// En el frontend (Next.js)
const { getToken } = useAuth();
const token = await getToken();

// En las peticiones
fetch('/api/files/1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### **Configuración en Swagger UI**
1. Haz clic en el botón **"Authorize"** en la parte superior
2. Selecciona **"clerkAuth"**
3. Ingresa tu token de Clerk en el formato: `Bearer tu_token_aqui`
4. Haz clic en **"Authorize"**

## 📊 Esquemas de Datos

### **Esquema Archivo**
```json
{
  "idArchivo": 1,
  "nombreOriginal": "radiografia.jpg",
  "nombreArchivo": "1640995200000_radiografia.jpg",
  "rutaArchivo": "uploads/2024/01/1640995200000_radiografia.jpg",
  "tipoMime": "image/jpeg",
  "tamanoArchivo": 1024000,
  "extension": ".jpg",
  "descripcion": "Radiografía de rodilla izquierda",
  "categoria": "Radiografías",
  "etiquetas": "rodilla, lateral, lesión",
  "esPublico": false,
  "fechaSubida": "2024-01-15T10:00:00Z",
  "fechaModificacion": "2024-01-15T10:00:00Z",
  "idUsuario": 1,
  "idExpediente": 5,
  "activo": true
}
```

### **Esquema Paginación**
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "pages": 3,
  "hasNext": true,
  "hasPrev": false
}
```

## 🧪 Pruebas en Swagger UI

### **1. Probar Listado de Archivos**
1. Ve a `GET /api/files/{idUsuario}`
2. Haz clic en **"Try it out"**
3. Ingresa un `idUsuario` válido (ej: 1)
4. Opcionalmente agrega parámetros de consulta
5. Haz clic en **"Execute"**

### **2. Probar Subida de Archivos**
1. Ve a `POST /api/files/{idUsuario}/upload`
2. Haz clic en **"Try it out"**
3. Ingresa un `idUsuario` válido
4. En el campo `files`, selecciona archivos de tu computadora
5. Opcionalmente agrega `expedienteId` y `categoria`
6. Haz clic en **"Execute"**

### **3. Probar Servir Archivo**
1. Ve a `GET /api/files/{idUsuario}/{id}/serve`
2. Haz clic en **"Try it out"**
3. Ingresa `idUsuario` e `id` válidos
4. Haz clic en **"Execute"**
5. El archivo se mostrará directamente en el navegador

## 📱 Ejemplos de Uso en Frontend

### **Mostrar Imagen**
```jsx
<img 
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  alt="Descripción de la imagen"
  style={{ maxWidth: '100%', height: 'auto' }}
/>
```

### **Mostrar PDF**
```jsx
<iframe
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  width="100%"
  height="600px"
  title="Documento PDF"
/>
```

### **Mostrar Video**
```jsx
<video
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  controls
  width="100%"
  height="400px"
>
  Tu navegador no soporta el elemento video.
</video>
```

### **Descargar Archivo**
```javascript
const descargarArchivo = async (idArchivo, nombreArchivo) => {
  const token = await getToken();
  const response = await fetch(`/api/files/${idUsuario}/${idArchivo}/download`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
```

## 🔧 Configuración de Next.js

### **next.config.js**
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

### **Variables de Entorno (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_key_aqui
```

## 🚨 Códigos de Error

### **400 - Bad Request**
- Parámetros inválidos
- Archivo demasiado grande
- Tipo de archivo no permitido

### **401 - Unauthorized**
- Token de Clerk inválido o expirado
- Usuario no autenticado

### **404 - Not Found**
- Archivo no encontrado
- Usuario no existe
- Archivo eliminado

### **413 - Payload Too Large**
- Archivo excede el límite de 10MB
- Múltiples archivos exceden el límite total

### **500 - Internal Server Error**
- Error del servidor
- Problemas de base de datos
- Error en el sistema de archivos

## 📈 Mejores Prácticas

### **1. Manejo de Errores**
```javascript
try {
  const response = await fetch('/api/files/1/1/serve');
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  // Procesar respuesta
} catch (error) {
  console.error('Error:', error.message);
}
```

### **2. Optimización de Imágenes**
```jsx
// Usar lazy loading para imágenes
<img 
  src={`/api/files/${idUsuario}/${idArchivo}/serve`}
  loading="lazy"
  alt="Descripción"
/>
```

### **3. Cache de Archivos**
```javascript
// Los archivos servidos tienen cache de 1 hora
// Para forzar actualización, agrega timestamp
const url = `/api/files/${idUsuario}/${idArchivo}/serve?t=${Date.now()}`;
```

### **4. Streaming para Archivos Grandes**
```javascript
// Para archivos grandes, usar Range requests
const response = await fetch('/api/files/1/1/serve', {
  headers: {
    'Range': 'bytes=0-1023' // Primeros 1KB
  }
});
```

## 🔍 Debugging

### **1. Verificar Headers**
```javascript
const response = await fetch('/api/files/1/1/serve');
console.log('Content-Type:', response.headers.get('content-type'));
console.log('Content-Length:', response.headers.get('content-length'));
console.log('Cache-Control:', response.headers.get('cache-control'));
```

### **2. Verificar Autenticación**
```javascript
const token = await getToken();
console.log('Token:', token ? 'Presente' : 'Ausente');
```

### **3. Verificar Permisos**
```javascript
// Verificar que el usuario tiene acceso al archivo
const response = await fetch(`/api/files/${idUsuario}/${idArchivo}`);
if (response.status === 404) {
  console.log('Archivo no encontrado o sin permisos');
}
```

## 📚 Recursos Adicionales

- [Documentación de Clerk](https://clerk.com/docs)
- [Guía de Next.js](https://nextjs.org/docs)
- [Documentación de Swagger](https://swagger.io/docs/)
- [Guía de Multer](https://github.com/expressjs/multer)

---

¡Con esta documentación puedes usar completamente la API de archivos desde Swagger UI! 🚀
