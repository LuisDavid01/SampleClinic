# 📋 Documentación - Nuevos Endpoints de Citas

## 🎯 Historia de Usuario Implementada
**Como paciente de la clínica, necesito ver los detalles de cada una de mis citas con la finalidad de entender mejor los tratamientos que he recibido**

## 🚀 Endpoints Creados

### 1. **GET /api/citas/:id/detalles-completos**
**Obtener detalles completos de una cita específica**

#### Descripción
Endpoint diseñado específicamente para la historia de usuario. Obtiene todos los detalles de una cita incluyendo diagnósticos, documentos, archivos y expediente del paciente.

#### Parámetros
- `id` (path): ID de la cita

#### Respuesta
```json
{
  "cita": {
    "idCita": 1,
    "fechaCita": "2024-01-15T10:00:00Z",
    "descripcion": "Sesión de fisioterapia para lesión de rodilla",
    "estadoCita": "completada",
    "paciente": {
      "idUsuario": 1,
      "nombre": "Juan",
      "apellido1": "Pérez",
      "apellido2": "García",
      "correoElectronico": "juan@email.com",
      "telefonoPrincipal": "555-0001"
    },
    "medico": {
      "idUsuario": 2,
      "nombre": "Dr. María",
      "apellido1": "González",
      "apellido2": "López",
      "correoElectronico": "maria@email.com",
      "telefonoPrincipal": "555-0002"
    },
    "servicio": {
      "idServicio": 1,
      "nombreServicio": "Fisioterapia de Rodilla",
      "descripcion": "Tratamiento especializado",
      "precio": 50.00
    },
    "notas": [...],
    "resultados": [...]
  },
  "diagnosticos": [...],
  "expediente": {...},
  "archivos": [...]
}
```

#### Permisos
- Paciente: Solo sus propias citas
- Médico: Solo citas donde es el médico asignado
- Administrador: Todas las citas

---

### 2. **GET /api/citas/:id/diagnosticos**
**Obtener diagnósticos relacionados con una cita**

#### Descripción
Obtiene todos los diagnósticos del paciente de una cita específica. Útil para mostrar el historial médico relacionado.

#### Parámetros
- `id` (path): ID de la cita
- `limit` (query, opcional): Número máximo de diagnósticos (default: 10)

#### Respuesta
```json
{
  "diagnosticos": [
    {
      "idDiagnostico": 1,
      "diagnostico": "Lesión de ligamento cruzado anterior",
      "fecha": "2024-01-10",
      "doctor": {
        "idUsuario": 2,
        "nombre": "Dr. María",
        "apellido1": "González",
        "apellido2": "López"
      }
    }
  ],
  "total": 1
}
```

---

### 3. **GET /api/citas/:id/documentos**
**Obtener documentos y archivos relacionados con una cita**

#### Descripción
Obtiene todos los documentos y archivos del paciente de una cita específica. Incluye documentos del expediente y archivos subidos por el usuario.

#### Parámetros
- `id` (path): ID de la cita
- `categoria` (query, opcional): Filtrar por categoría de archivo
- `tipoDocumento` (query, opcional): Filtrar por tipo de documento

#### Respuesta
```json
{
  "documentos": [
    {
      "idDocumento": 1,
      "url": "/documentos/consentimiento_12345678.pdf",
      "tipoDocumento": "consentimiento",
      "fechaCreacion": "2024-01-15T10:00:00Z"
    }
  ],
  "archivos": [
    {
      "idArchivo": 1,
      "nombreOriginal": "radiografia_rodilla.pdf",
      "nombreArchivo": "radiografia_rodilla_123456.pdf",
      "tipoMime": "application/pdf",
      "tamanoArchivo": 1024000,
      "extension": ".pdf",
      "descripcion": "Radiografía de rodilla derecha",
      "categoria": "imagenes_medicas",
      "fechaSubida": "2024-01-15T10:00:00Z"
    }
  ],
  "totalDocumentos": 1,
  "totalArchivos": 1
}
```

---

### 4. **GET /api/citas/:id/recetas**
**Obtener recetas relacionadas con una cita**

#### Descripción
Obtiene todas las recetas (archivos con categoría "receta") del paciente de una cita específica. Implementa la funcionalidad de recetas usando la tabla de archivos con categoría específica.

#### Parámetros
- `id` (path): ID de la cita
- `limit` (query, opcional): Número máximo de recetas (default: 20)
- `fechaDesde` (query, opcional): Filtrar recetas desde una fecha
- `fechaHasta` (query, opcional): Filtrar recetas hasta una fecha

#### Respuesta
```json
{
  "recetas": [
    {
      "idArchivo": 1,
      "nombreOriginal": "receta_medicamentos.pdf",
      "nombreArchivo": "receta_medicamentos_123456.pdf",
      "tipoMime": "application/pdf",
      "tamanoArchivo": 512000,
      "extension": ".pdf",
      "descripcion": "Receta de medicamentos para tratamiento",
      "categoria": "receta",
      "fechaSubida": "2024-01-15T10:00:00Z",
      "urlDescarga": "/api/archivos/1/1/download"
    }
  ],
  "total": 1,
  "resumen": {
    "totalRecetas": 1,
    "recetasRecientes": 1,
    "tiposArchivo": [".pdf"]
  }
}
```

---

### 5. **POST /api/citas/:id/recetas**
**Agregar receta a una cita**

#### Descripción
Agrega una nueva receta (archivo con categoría "receta") relacionada con una cita específica. Solo médicos y administradores pueden agregar recetas.

#### Parámetros
- `id` (path): ID de la cita

#### Body
```json
{
  "nombreOriginal": "Receta_Medicamentos_2024.pdf",
  "descripcion": "Receta de medicamentos para tratamiento post-operatorio",
  "tipoMime": "application/pdf",
  "tamanoArchivo": 1024000,
  "extension": ".pdf"
}
```

#### Respuesta
```json
{
  "message": "Receta agregada exitosamente",
  "receta": {
    "idArchivo": 1,
    "nombreOriginal": "Receta_Medicamentos_2024.pdf",
    "descripcion": "Receta de medicamentos para tratamiento post-operatorio",
    "categoria": "receta",
    "fechaSubida": "2024-01-15T10:00:00Z"
  }
}
```

#### Permisos
- Solo fisioterapeutas y administradores
- Solo el médico asignado a la cita o administradores

---

## 🔐 Control de Permisos

### Matriz de Permisos

| Endpoint | Paciente | Médico | Administrador |
|----------|----------|--------|---------------|
| `GET /detalles-completos` | ✅ Solo sus citas | ✅ Solo sus citas | ✅ Todas las citas |
| `GET /diagnosticos` | ✅ Solo sus citas | ✅ Solo sus citas | ✅ Todas las citas |
| `GET /documentos` | ✅ Solo sus citas | ✅ Solo sus citas | ✅ Todas las citas |
| `GET /recetas` | ✅ Solo sus citas | ✅ Solo sus citas | ✅ Todas las citas |
| `POST /recetas` | ❌ No permitido | ✅ Solo sus citas | ✅ Todas las citas |

### Autenticación
Todos los endpoints requieren autenticación con Clerk:
```bash
Authorization: Bearer <clerk_token>
```

---

## 🧪 Pruebas Realizadas

### ✅ Validaciones Completadas
1. **Estructura de Base de Datos**: Todas las tablas y relaciones existen
2. **Funcionalidad Completa**: Creación y consulta de datos completos
3. **Control de Permisos**: Verificación de acceso por rol
4. **Filtros y Paginación**: Funcionamiento correcto de parámetros
5. **Manejo de Errores**: Respuestas apropiadas para casos de error

### 📊 Resultados de Pruebas
```
🎉 Prueba de nuevos endpoints completada exitosamente!

📋 ENDPOINTS CREADOS:
✅ GET /api/citas/:id/detalles-completos - Detalles completos de cita
✅ GET /api/citas/:id/diagnosticos - Diagnósticos relacionados
✅ GET /api/citas/:id/documentos - Documentos y archivos relacionados
✅ GET /api/citas/:id/recetas - Recetas relacionadas
✅ POST /api/citas/:id/recetas - Agregar receta

🔧 FUNCIONALIDADES IMPLEMENTADAS:
✅ Visualización completa de detalles de citas
✅ Acceso a diagnósticos del paciente
✅ Visualización de documentos y archivos
✅ Gestión de recetas médicas
✅ Control de permisos por rol
✅ Filtros y paginación
```

---

## 🎯 Cumplimiento de Historia de Usuario

### Campos Requeridos vs Implementados

| Campo Requerido | Endpoint | Estado |
|----------------|----------|--------|
| **Fecha de la cita** | `/detalles-completos` | ✅ Implementado |
| **Diagnóstico planteado** | `/diagnosticos` | ✅ Implementado |
| **Razón de la cita** | `/detalles-completos` | ✅ Implementado |
| **Doctor que realizó el tratamiento** | `/detalles-completos` | ✅ Implementado |
| **Recetas** | `/recetas` | ✅ Implementado |
| **Documentos relacionados** | `/documentos` | ✅ Implementado |

### Funcionalidades Adicionales
- ✅ **Notas médicas**: Incluidas en detalles completos
- ✅ **Resultados de citas**: Incluidos en detalles completos
- ✅ **Expediente médico**: Acceso completo al expediente
- ✅ **Filtros avanzados**: Por fecha, categoría, tipo de documento
- ✅ **Paginación**: Control de límites y paginación
- ✅ **URLs de descarga**: Enlaces directos para archivos

---

## 🚀 Uso en Frontend

### Ejemplo de Implementación
```javascript
// Obtener detalles completos de una cita
const response = await fetch('/api/citas/1/detalles-completos', {
  headers: {
    'Authorization': `Bearer ${clerkToken}`
  }
});
const data = await response.json();

// Mostrar información al paciente
console.log('Cita:', data.cita);
console.log('Diagnósticos:', data.diagnosticos);
console.log('Documentos:', data.documentos);
console.log('Recetas:', data.archivos.filter(a => a.categoria === 'receta'));
```

### Integración con Swagger
Todos los endpoints están documentados en Swagger y disponibles en:
```
http://localhost:3001/api-docs
```

---

## 📁 Archivos Creados

1. **`src/routes/citas-detalles.js`** - Endpoints para detalles completos
2. **`src/routes/citas-recetas.js`** - Endpoints para gestión de recetas
3. **`Script_Test/test-nuevos-endpoints-citas.js`** - Script de pruebas
4. **`ENDPOINTS-CITAS-DETALLES.md`** - Esta documentación

---

## ✅ Conclusión

**Los nuevos endpoints cumplen completamente con la historia de usuario**, proporcionando a los pacientes acceso completo a todos los detalles de sus citas, incluyendo diagnósticos, documentos, archivos y recetas, con el control de permisos apropiado y una interfaz de API robusta y bien documentada.

---
*Documentación generada el: $(date)*
*Endpoints implementados y probados exitosamente* ✅
