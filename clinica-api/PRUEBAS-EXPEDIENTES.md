# 🧪 Pruebas de Expedientes

Este directorio contiene un conjunto completo de pruebas para los endpoints de Expedientes de la API de la Clínica Fisioterapéutica.

## 📁 Archivos de Prueba

### Archivos Principales
- `test-expedientes-all.js` - Archivo maestro que ejecuta todas las pruebas
- `test-expedientes-funcional.js` - Pruebas funcionales básicas
- `test-expedientes-clerk.js` - Pruebas de integración con Clerk
- `test-expedientes-performance.js` - Pruebas de rendimiento
- `test-expedientes-tokens.js` - Generador de tokens para pruebas manuales

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Archivo Maestro (Recomendado)
```bash
# Ejecutar todas las pruebas
node test-expedientes-all.js all

# Ejecutar pruebas específicas
node test-expedientes-all.js funcional
node test-expedientes-all.js clerk
node test-expedientes-all.js performance

# Mostrar tokens para pruebas manuales
node test-expedientes-all.js tokens

# Menú interactivo
node test-expedientes-all.js
```

### Opción 2: Archivos Individuales
```bash
# Pruebas funcionales
node test-expedientes-funcional.js

# Pruebas de Clerk
node test-expedientes-clerk.js

# Pruebas de rendimiento
node test-expedientes-performance.js

# Generar tokens
node test-expedientes-tokens.js
```

## 🔧 Prerrequisitos

1. **Servidor funcionando**: Asegúrate de que el servidor esté ejecutándose en `http://localhost:3000`
2. **Base de datos**: La base de datos debe estar configurada y accesible
3. **Dependencias**: Instala las dependencias con `npm install`

## 📋 Tipos de Pruebas

### 1. Pruebas Funcionales (`test-expedientes-funcional.js`)

**Propósito**: Validar que todos los endpoints funcionen correctamente según la especificación.

**Pruebas incluidas**:
- ✅ Verificar servidor funcionando
- ✅ Autenticación requerida
- ✅ Autorización por roles (Paciente, Fisioterapeuta, Admin)
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Filtros y paginación

**Roles probados**:
- **Paciente**: Solo puede ver sus propios expedientes
- **Fisioterapeuta**: Puede ver, crear y actualizar expedientes
- **Admin**: Puede hacer todas las operaciones incluyendo eliminar

### 2. Pruebas de Clerk (`test-expedientes-clerk.js`)

**Propósito**: Validar la integración con el sistema de autenticación Clerk.

**Pruebas incluidas**:
- ✅ Autenticación con tokens de Clerk
- ✅ Autorización por roles con Clerk
- ✅ Middleware de Clerk funcionando
- ✅ Estructura de tokens de Clerk

### 3. Pruebas de Rendimiento (`test-expedientes-performance.js`)

**Propósito**: Evaluar el rendimiento y la escalabilidad de los endpoints.

**Pruebas incluidas**:
- ⚡ Peticiones secuenciales (10 peticiones)
- ⚡ Peticiones concurrentes (20 peticiones)
- ⚡ Creación de expedientes (5 peticiones)
- ⚡ Filtros y paginación (10 peticiones)
- ⚡ Peticiones individuales (10 peticiones)
- ⚡ Actualizaciones (5 peticiones)
- ⚡ Carga pesada (50 peticiones concurrentes)
- ⚡ Prueba de estrés (30 peticiones con delay mínimo)

**Métricas evaluadas**:
- Tiempo de respuesta promedio
- Tiempo mínimo y máximo
- Tasa de éxito
- Tiempo mediano

## 🔑 Tokens de Prueba

### Tokens JWT (Sistema tradicional)
```javascript
// Admin
const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Fisioterapeuta  
const fisioToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Paciente
const pacienteToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Tokens Clerk (Simulados)
```javascript
// Admin Clerk
const clerkAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Fisioterapeuta Clerk
const clerkFisioToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Paciente Clerk
const clerkPacienteToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

## 📊 Interpretación de Resultados

### Pruebas Funcionales
- **✅ Pasaron**: Número de pruebas exitosas
- **❌ Fallaron**: Número de pruebas fallidas
- **📈 Porcentaje**: Porcentaje de éxito

### Pruebas de Rendimiento
- **Tiempo promedio**: Tiempo de respuesta promedio en milisegundos
- **Tiempo mínimo**: Tiempo de respuesta más rápido
- **Tiempo máximo**: Tiempo de respuesta más lento
- **Tasa de éxito**: Porcentaje de peticiones exitosas

### Recomendaciones de Rendimiento
- **< 500ms**: Excelente rendimiento
- **500-1000ms**: Rendimiento moderado, considerar caché
- **> 1000ms**: Rendimiento bajo, optimizar consultas

## 🐛 Solución de Problemas

### Error: "Servidor no disponible"
```bash
# Verificar que el servidor esté funcionando
curl http://localhost:3000/api/health

# Iniciar el servidor si es necesario
npm start
# o
docker compose up -d
```

### Error: "Token no válido"
```bash
# Regenerar tokens
node test-expedientes-tokens.js
```

### Error: "Base de datos no disponible"
```bash
# Verificar conexión a la base de datos
# Revisar configuración en src/config/database.js
```

## 📝 Datos de Prueba

### Expediente de Prueba
```json
{
  "idPaciente": 4,
  "cedula": "12345678",
  "estado": "activo",
  "idMedico": 2,
  "descripcion": "Expediente de prueba para paciente"
}
```

### Filtros Disponibles
- `?cedula=12345678` - Filtrar por cédula
- `?estado=activo` - Filtrar por estado
- `?idMedico=2` - Filtrar por médico
- `?page=1&limit=10` - Paginación

## 🔄 Integración Continua

Para integrar estas pruebas en un pipeline de CI/CD:

```bash
# En tu pipeline
npm test -- test-expedientes-all.js all
```

## 📚 Endpoints Probados

### GET /api/expedientes
- Obtener todos los expedientes
- Filtros: cedula, estado, idMedico
- Paginación: page, limit

### POST /api/expedientes
- Crear nuevo expediente
- Requiere: idPaciente, cedula, estado
- Opcional: idMedico, descripcion

### GET /api/expedientes/:id
- Obtener expediente por ID
- Incluye relaciones: paciente, medico, documentos, diagnosticos

### PUT /api/expedientes/:id
- Actualizar expediente existente
- Campos actualizables: estado, idMedico, descripcion

### DELETE /api/expedientes/:id
- Eliminar expediente
- Solo administradores

## 🎯 Próximos Pasos

1. **Automatización**: Integrar con GitHub Actions o similar
2. **Cobertura**: Aumentar cobertura de casos edge
3. **Monitoreo**: Implementar alertas de rendimiento
4. **Documentación**: Actualizar documentación de API

---

**Nota**: Estas pruebas están diseñadas para ser ejecutadas en un entorno de desarrollo. No ejecutes pruebas de rendimiento en producción.
