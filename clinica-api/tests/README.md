# 🧪 Suite de Pruebas - Clínica API

Esta carpeta contiene todas las pruebas para la API de la Clínica Fisioterapéutica, organizadas por tipo y funcionalidad.

## 📁 Estructura de Carpetas

```
tests/
├── functional/          # Pruebas funcionales básicas
├── integration/         # Pruebas de integración (Clerk, etc.)
├── performance/         # Pruebas de rendimiento
├── utils/              # Utilidades y generadores de datos
└── README.md           # Este archivo
```

## 🧪 Tipos de Pruebas

### 🔧 **Pruebas Funcionales** (`functional/`)
- **`test-expedientes-funcional.js`** - Pruebas CRUD básicas de expedientes
- **`test-expedientes-clerk-real.js`** - Pruebas con tokens reales de Clerk

### 🔗 **Pruebas de Integración** (`integration/`)
- **`test-expedientes-clerk.js`** - Pruebas de integración con Clerk

### ⚡ **Pruebas de Rendimiento** (`performance/`)
- **`test-expedientes-performance.js`** - Pruebas de carga y rendimiento

### 🛠️ **Utilidades** (`utils/`)
- **`test-expedientes-tokens.js`** - Generador de tokens para pruebas

### 🎯 **Archivo Maestro**
- **`test-expedientes-all.js`** - Ejecutor principal de todas las pruebas

## 🚀 Cómo Ejecutar las Pruebas

### Opción 1: Archivo Maestro (Recomendado)
```bash
# Ejecutar todas las pruebas
node tests/test-expedientes-all.js all

# Ejecutar pruebas específicas
node tests/test-expedientes-all.js funcional
node tests/test-expedientes-all.js integration
node tests/test-expedientes-all.js performance

# Mostrar tokens para pruebas manuales
node tests/test-expedientes-all.js tokens

# Menú interactivo
node tests/test-expedientes-all.js
```

### Opción 2: Archivos Individuales
```bash
# Pruebas funcionales
node tests/functional/test-expedientes-funcional.js
node tests/functional/test-expedientes-clerk-real.js

# Pruebas de integración
node tests/integration/test-expedientes-clerk.js

# Pruebas de rendimiento
node tests/performance/test-expedientes-performance.js

# Generar tokens
node tests/utils/test-expedientes-tokens.js
```

## 🔧 Prerrequisitos

1. **Servidor funcionando**: Asegúrate de que el servidor esté ejecutándose en `http://localhost:3001`
2. **Base de datos**: La base de datos debe estar configurada y accesible
3. **Dependencias**: Instala las dependencias con `npm install`
4. **Datos de prueba**: Ejecuta el script de población de datos:
   ```bash
   node scripts/populate-essential-data.js
   ```

## 📊 Cobertura de Pruebas

### **Endpoints de Expedientes:**
- ✅ `GET /api/expedientes` - Listar expedientes
- ✅ `POST /api/expedientes` - Crear expediente
- ✅ `GET /api/expedientes/:id` - Obtener expediente por ID
- ✅ `PUT /api/expedientes/:id` - Actualizar expediente
- ✅ `DELETE /api/expedientes/:id` - Eliminar expediente

### **Funcionalidades Probadas:**
- ✅ Autenticación con Clerk
- ✅ Autorización por roles (admin, medico, paciente)
- ✅ Validación de datos
- ✅ Filtros y paginación
- ✅ Manejo de errores
- ✅ Rendimiento y carga

## 🎯 Resultados Esperados

### **Pruebas Funcionales:**
- **Objetivo**: 100% de endpoints funcionando
- **Métricas**: Tiempo de respuesta < 500ms
- **Cobertura**: Todos los casos de uso principales

### **Pruebas de Integración:**
- **Objetivo**: Integración completa con Clerk
- **Métricas**: Autenticación exitosa, autorización correcta
- **Cobertura**: Todos los flujos de autenticación

### **Pruebas de Rendimiento:**
- **Objetivo**: Manejo de carga adecuado
- **Métricas**: < 1000ms promedio, > 95% éxito
- **Cobertura**: Escalabilidad y estabilidad

## 🔍 Solución de Problemas

### **Error: "Servidor no disponible"**
```bash
# Verificar que el servidor esté funcionando
curl http://localhost:3001/api/health

# Iniciar el servidor si es necesario
npm start
# o
docker compose up -d
```

### **Error: "Token no válido"**
```bash
# Regenerar tokens
node tests/utils/test-expedientes-tokens.js
```

### **Error: "Base de datos no disponible"**
```bash
# Poblar la base de datos
node scripts/populate-essential-data.js
```

## 📝 Notas de Desarrollo

- **Tokens de Clerk**: Los tokens expiran rápidamente, necesitas tokens frescos para pruebas
- **Datos de prueba**: Usa cédulas únicas para evitar conflictos
- **Roles**: Los endpoints usan strings de roles ('admin', 'medico', 'paciente')
- **Base de datos**: Asegúrate de que esté poblada con datos esenciales

## 🚀 Próximos Pasos

1. **Automatización**: Integrar con GitHub Actions
2. **Cobertura**: Aumentar cobertura de casos edge
3. **Monitoreo**: Implementar alertas de rendimiento
4. **Documentación**: Actualizar documentación de API

---

**Nota**: Estas pruebas están diseñadas para ser ejecutadas en un entorno de desarrollo. No ejecutes pruebas de rendimiento en producción.
