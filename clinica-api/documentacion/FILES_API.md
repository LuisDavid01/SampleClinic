# 📁 Sistema de Gestión de Archivos - API

Sistema completo de gestión de archivos para la API de la clínica fisioterapéutica.

## 🚀 Características

- **Subida de archivos múltiples** (hasta 5 archivos por request)
- **Tipos de archivo permitidos**: Imágenes, PDFs, documentos de Office, archivos de texto, comprimidos
- **Límite de tamaño**: 10MB por archivo
- **Almacenamiento organizado** por usuario
- **Metadatos completos**: descripción, categoría, etiquetas, visibilidad
- **Asociación con expedientes** médicos
- **Paginación y filtros** avanzados
- **Seguridad**: Solo usuarios autenticados pueden acceder a sus archivos

## 📋 Endpoints Disponibles

### 1. Listar Archivos
```
GET /api/files/{idUsuario}
```

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `categoria` (opcional): Filtrar por categoría
- `search` (opcional): Buscar en nombre, descripción o etiquetas
- `expedienteId` (opcional): Filtrar por expediente médico

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "idArchivo": 1,
      "nombreOriginal": "documento.pdf",
      "nombreArchivo": "documento-1234567890.pdf",
      "rutaArchivo": "user_1/documento-1234567890.pdf",
      "tipoMime": "application/pdf",
      "tamanoArchivo": 1024000,
      "extension": ".pdf",
      "descripcion": "Documento médico",
      "categoria": "medico",
      "etiquetas": "consulta,diagnostico",
      "esPublico": false,
      "fechaSubida": "2024-01-15T10:00:00Z",
      "fechaModificacion": "2024-01-15T10:00:00Z",
      "idUsuario": 1,
      "idExpediente": 1,
      "activo": true,
      "expediente": {
        "idExpediente": 1,
        "cedula": "12345678",
        "estado": "activo"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Obtener Información de Archivo
```
GET /api/files/{idUsuario}/{id}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "idArchivo": 1,
    "nombreOriginal": "documento.pdf",
    "nombreArchivo": "documento-1234567890.pdf",
    "rutaArchivo": "user_1/documento-1234567890.pdf",
    "tipoMime": "application/pdf",
    "tamanoArchivo": 1024000,
    "extension": ".pdf",
    "descripcion": "Documento médico",
    "categoria": "medico",
    "etiquetas": "consulta,diagnostico",
    "esPublico": false,
    "fechaSubida": "2024-01-15T10:00:00Z",
    "fechaModificacion": "2024-01-15T10:00:00Z",
    "idUsuario": 1,
    "idExpediente": 1,
    "activo": true,
    "expediente": {
      "idExpediente": 1,
      "cedula": "12345678",
      "estado": "activo"
    }
  }
}
```

### 3. Descargar Archivo
```
GET /api/files/{idUsuario}/{id}/download
```

**Respuesta:** Archivo binario con headers apropiados para descarga.

### 4. Subir Archivos
```
POST /api/files/{idUsuario}/upload
```

**Content-Type:** `multipart/form-data`

**Campos:**
- `files`: Array de archivos (máximo 5)
- `expedienteId` (opcional): ID del expediente médico
- `categoria` (opcional): Categoría del archivo

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "idArchivo": 1,
      "nombreOriginal": "documento.pdf",
      "nombreArchivo": "documento-1234567890.pdf",
      "rutaArchivo": "user_1/documento-1234567890.pdf",
      "tipoMime": "application/pdf",
      "tamanoArchivo": 1024000,
      "extension": ".pdf",
      "descripcion": null,
      "categoria": "medico",
      "etiquetas": null,
      "esPublico": false,
      "fechaSubida": "2024-01-15T10:00:00Z",
      "fechaModificacion": "2024-01-15T10:00:00Z",
      "idUsuario": 1,
      "idExpediente": 1,
      "activo": true
    }
  ],
  "message": "1 archivo(s) subido(s) exitosamente"
}
```

### 5. Actualizar Metadata
```
PATCH /api/files/{idUsuario}/{id}
```

**Body:**
```json
{
  "descripcion": "Nueva descripción del archivo",
  "categoria": "nueva_categoria",
  "etiquetas": "nueva,etiqueta",
  "esPublico": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "idArchivo": 1,
    "nombreOriginal": "documento.pdf",
    "nombreArchivo": "documento-1234567890.pdf",
    "rutaArchivo": "user_1/documento-1234567890.pdf",
    "tipoMime": "application/pdf",
    "tamanoArchivo": 1024000,
    "extension": ".pdf",
    "descripcion": "Nueva descripción del archivo",
    "categoria": "nueva_categoria",
    "etiquetas": "nueva,etiqueta",
    "esPublico": true,
    "fechaSubida": "2024-01-15T10:00:00Z",
    "fechaModificacion": "2024-01-15T11:00:00Z",
    "idUsuario": 1,
    "idExpediente": 1,
    "activo": true,
    "expediente": {
      "idExpediente": 1,
      "cedula": "12345678",
      "estado": "activo"
    }
  },
  "message": "Archivo actualizado exitosamente"
}
```

### 6. Eliminar Archivo
```
DELETE /api/files/{idUsuario}/{id}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

### 7. Obtener Categorías
```
GET /api/files/{idUsuario}/categories
```

**Respuesta:**
```json
{
  "success": true,
  "data": ["medico", "consulta", "diagnostico", "imagen"]
}
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación con Clerk. Incluir el token en el header:

```
Authorization: Bearer <clerk_token>
```

**Nota:** El `idUsuario` se pasa como parámetro en la URL, no se obtiene del token.

## 📁 Estructura de Almacenamiento

Los archivos se almacenan en:
```
uploads/
├── user_1/
│   ├── documento-1234567890.pdf
│   └── imagen-1234567890.jpg
├── user_2/
│   └── archivo-1234567890.docx
└── anonymous/
    └── archivo-1234567890.txt
```

## 🛡️ Seguridad

- **Validación de tipos**: Solo tipos de archivo permitidos
- **Límites de tamaño**: 10MB máximo por archivo
- **Límites de cantidad**: Máximo 5 archivos por request
- **Aislamiento por usuario**: Cada usuario solo puede acceder a sus archivos
- **Soft delete**: Los archivos se marcan como inactivos, no se eliminan físicamente inmediatamente

## 📝 Tipos de Archivo Permitidos

- **Imágenes**: JPEG, PNG, GIF, WebP
- **Documentos**: PDF, DOC, DOCX, XLS, XLSX
- **Texto**: TXT
- **Comprimidos**: ZIP, RAR

## 🚨 Códigos de Error

- `400`: Error en la solicitud (archivo muy grande, tipo no permitido, etc.)
- `401`: No autorizado
- `404`: Archivo no encontrado
- `500`: Error interno del servidor

## 📚 Documentación Swagger

La documentación completa está disponible en:
- **URL**: `http://localhost:3001/api-docs`
- **Sección**: Archivos

## 🔧 Configuración

### Variables de Entorno
```env
# Límites de archivos (opcional, valores por defecto)
MAX_FILE_SIZE=10485760  # 10MB
MAX_FILES=5
```

### Estructura de Base de Datos
```sql
CREATE TABLE archivos (
  id_archivo SERIAL PRIMARY KEY,
  nombre_original VARCHAR(255) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo VARCHAR(500) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  tamano_archivo INTEGER NOT NULL,
  extension VARCHAR(10) NOT NULL,
  descripcion VARCHAR(500),
  categoria VARCHAR(100),
  etiquetas VARCHAR(500),
  es_publico BOOLEAN DEFAULT FALSE,
  fecha_subida TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  id_expediente INTEGER REFERENCES expediente(id_expediente),
  activo BOOLEAN DEFAULT TRUE
);
```

## 🧪 Ejemplos de Uso

### Subir archivos con JavaScript
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('expedienteId', '1');
formData.append('categoria', 'medico');

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Listar archivos con filtros
```javascript
const response = await fetch('/api/files?page=1&limit=10&categoria=medico&search=consulta', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Descargar archivo
```javascript
const response = await fetch('/api/files/1/download', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'archivo.pdf';
a.click();
```
