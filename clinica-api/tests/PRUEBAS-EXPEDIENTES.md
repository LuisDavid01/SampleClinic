# 🧪 Documentación de Pruebas - Expedientes

## 📋 Resumen

Este documento describe la suite completa de pruebas para el endpoint de **Expedientes** en la API de la Clínica Fisioterapéutica.

## 🎯 Objetivos de las Pruebas

- ✅ **Funcionalidad**: Verificar que todos los endpoints CRUD funcionen correctamente
- ✅ **Seguridad**: Validar autenticación y autorización con Clerk
- ✅ **Rendimiento**: Asegurar tiempos de respuesta adecuados
- ✅ **Integridad**: Confirmar validación de datos y manejo de errores
- ✅ **Escalabilidad**: Probar comportamiento bajo carga

## 🏗️ Arquitectura de Pruebas

```
tests/
├── functional/              # Pruebas funcionales básicas
│   ├── test-expedientes-funcional.js
│   └── test-expedientes-clerk-real.js
├── integration/             # Pruebas de integración
│   └── test-expedientes-clerk.js
├── performance/             # Pruebas de rendimiento
│   └── test-expedientes-performance.js
├── utils/                   # Utilidades y generadores
│   ├── common.js
│   └── test-expedientes-tokens.js
├── config.js               # Configuración centralizada
├── test-expedientes-all.js # Ejecutor maestro
└── README.md               # Documentación general
```

## 🚀 Formas de Ejecutar las Pruebas

### 1. **Script de NPM (Recomendado)**
```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm run test:funcional
npm run test:integration
npm run test:performance

# Mostrar tokens
npm run test:tokens

# Menú interactivo
npm run test:menu

# Poblar base de datos
npm run test:populate
```

### 2. **Script Directo**
```bash
# Todas las pruebas
node run-tests.js all

# Pruebas específicas
node run-tests.js funcional
node run-tests.js integration
node run-tests.js performance

# Mostrar tokens
node run-tests.js tokens

# Menú interactivo
node run-tests.js menu
```

### 3. **Archivos Individuales**
```bash
# Pruebas funcionales
node tests/functional/test-expedientes-funcional.js
node tests/functional/test-expedientes-clerk-real.js

# Pruebas de integración
node tests/integration/test-expedientes-clerk.js

# Pruebas de rendimiento
node tests/performance/test-expedientes-performance.js
```

## 📊 Cobertura de Pruebas

### **Endpoints Cubiertos:**
- ✅ `GET /api/expedientes` - Listar expedientes
- ✅ `POST /api/expedientes` - Crear expediente
- ✅ `GET /api/expedientes/:id` - Obtener expediente por ID
- ✅ `PUT /api/expedientes/:id` - Actualizar expediente
- ✅ `DELETE /api/expedientes/:id` - Eliminar expediente

### **Casos de Prueba:**

#### **🔧 Pruebas Funcionales:**
1. **Verificación del servidor**
   - Health check del servidor
   - Disponibilidad de la API

2. **CRUD básico**
   - Crear expediente válido
   - Obtener expediente por ID
   - Listar todos los expedientes
   - Actualizar expediente existente
   - Eliminar expediente

3. **Validación de datos**
   - Campos requeridos
   - Tipos de datos correctos
   - Restricciones de negocio

4. **Filtros y paginación**
   - Filtros por estado
   - Filtros por médico
   - Paginación básica

#### **🔗 Pruebas de Integración:**
1. **Autenticación Clerk**
   - Token válido
   - Token expirado
   - Token inválido

2. **Autorización por roles**
   - Admin: Acceso completo
   - Médico: Crear/leer/actualizar
   - Paciente: Solo sus expedientes

3. **Flujos completos**
   - Login → Crear expediente → Actualizar → Eliminar

#### **⚡ Pruebas de Rendimiento:**
1. **Carga normal**
   - 20 peticiones concurrentes
   - Tiempo promedio < 500ms

2. **Carga pesada**
   - 50 peticiones concurrentes
   - Tiempo promedio < 1000ms

3. **Pruebas de estrés**
   - 30 peticiones con delay de 10ms
   - Verificar estabilidad

## 🔧 Configuración

### **Variables de Entorno Requeridas:**
```bash
DATABASE_URL="postgresql://postgres:CHANGE_ME_DB_PASSWORD@localhost:5432/salena_fisio"
JWT_SECRET="CHANGE_ME"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
PORT=3001
```

### **Prerrequisitos:**
1. **Servidor funcionando** en `http://localhost:3001`
2. **Base de datos** configurada y accesible
3. **Datos de prueba** poblados:
   ```bash
   npm run test:populate
   ```

## 📈 Métricas de Éxito

### **Pruebas Funcionales:**
- ✅ **Tasa de éxito**: 100%
- ⏱️ **Tiempo de respuesta**: < 500ms promedio
- 🎯 **Cobertura**: Todos los endpoints

### **Pruebas de Integración:**
- ✅ **Autenticación**: 100% exitosa
- 🔐 **Autorización**: Roles correctos
- 🔄 **Flujos completos**: Sin errores

### **Pruebas de Rendimiento:**
- ✅ **Tasa de éxito**: > 95%
- ⏱️ **Tiempo promedio**: < 1000ms
- 🚀 **Escalabilidad**: Manejo de carga adecuado

## 🐛 Solución de Problemas

### **Error: "Servidor no disponible"**
```bash
# Verificar servidor
curl http://localhost:3001/api/health

# Iniciar servidor
npm start
# o
docker compose up -d
```

### **Error: "Token no válido"**
```bash
# Regenerar tokens
npm run test:tokens

# Obtener token real de Clerk
# (Ver documentación de Clerk)
```

### **Error: "Base de datos no disponible"**
```bash
# Poblar base de datos
npm run test:populate

# Verificar conexión
npx prisma studio
```

### **Error: "Datos duplicados"**
```bash
# Los tests generan cédulas únicas automáticamente
# Si persiste, reinicia la base de datos:
npx prisma migrate reset
npm run test:populate
```

## 📝 Notas de Desarrollo

### **Tokens de Clerk:**
- Los tokens expiran rápidamente (1-2 horas)
- Necesitas tokens frescos para pruebas de integración
- Los tests funcionales usan tokens simulados

### **Datos de Prueba:**
- Se generan automáticamente con timestamps únicos
- No interfieren con datos de producción
- Se pueden limpiar con `prisma migrate reset`

### **Roles y Permisos:**
- **Admin**: Acceso completo a todos los expedientes
- **Médico**: Puede crear, leer y actualizar expedientes
- **Paciente**: Solo puede ver sus propios expedientes

## 🚀 Próximos Pasos

1. **Automatización CI/CD**: Integrar con GitHub Actions
2. **Cobertura de código**: Implementar métricas de cobertura
3. **Pruebas E2E**: Agregar pruebas end-to-end
4. **Monitoreo**: Implementar alertas de rendimiento
5. **Documentación**: Actualizar documentación de API

## 📚 Referencias

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Clerk](https://clerk.com/docs)
- [Documentación de Express.js](https://expressjs.com/)
- [Guía de Pruebas de API](https://restfulapi.net/testing-rest-apis/)

---

**Nota**: Estas pruebas están diseñadas para desarrollo. No ejecutes pruebas de rendimiento en producción.
