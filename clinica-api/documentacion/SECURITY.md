# 🔒 Documentación de Seguridad - Antecedentes Clínicos

## Resumen de Implementación

Se ha implementado un sistema completo de seguridad y auditoría para el manejo de antecedentes clínicos, incluyendo:

### 🛡️ Medidas de Seguridad Implementadas

#### 1. **Autenticación y Autorización**
- ✅ Autenticación obligatoria con Clerk
- ✅ Validación de roles (Admin/Fisioterapeuta)
- ✅ Verificación de permisos específicos por paciente
- ✅ Validación de existencia del paciente

#### 2. **Encriptación de Datos Sensibles**
- ✅ Encriptación AES-256-CBC para campos sensibles:
  - `urgenciasMedicas`
  - `contactoEmergenciaTelefono`
  - `notasAdicionales`
- ✅ Desencriptación automática en respuestas
- ✅ Clave de encriptación configurable via ENV

#### 3. **Rate Limiting**
- ✅ Límites por endpoint:
  - **POST**: 50 requests/15min
  - **GET**: 100 requests/15min
  - **PUT**: 30 requests/15min
  - **Historial**: 50 requests/15min

#### 4. **Validación de Integridad**
- ✅ Detección de scripts maliciosos
- ✅ Validación de contenido no permitido
- ✅ Sanitización de datos de entrada

#### 5. **Auditoría Completa**
- ✅ Registro automático de todas las acciones
- ✅ Tracking de usuario, IP, timestamp
- ✅ Almacenamiento de request/response sanitizados
- ✅ Historial de cambios por paciente

### 📊 Endpoints de Auditoría

#### **GET** `/api/auditoria/pacientes/{id}/antecedentes`
- Obtener historial de auditoría para un paciente específico
- Paginación incluida
- Solo administradores

#### **GET** `/api/auditoria/estadisticas`
- Estadísticas de uso por acción y usuario
- Filtros por fecha y usuario
- Solo administradores

#### **GET** `/api/auditoria/seguridad`
- Logs de seguridad con diferentes niveles
- Filtros por fecha y nivel de riesgo
- Solo administradores

#### **GET** `/api/auditoria/exportar`
- Exportación de datos de auditoría
- Formatos: JSON, CSV
- Solo administradores

### 🔐 Campos Encriptados

Los siguientes campos se encriptan automáticamente:

```javascript
// Campos sensibles que se encriptan
const sensitiveFields = [
  'urgenciasMedicas',           // Información médica de urgencia
  'contactoEmergenciaTelefono', // Teléfono de contacto de emergencia
  'notasAdicionales'            // Notas médicas adicionales
];
```

### 🚨 Logs de Seguridad

El sistema registra automáticamente:

- **Acciones**: CREAR, ACTUALIZAR, CONSULTAR, ELIMINAR
- **Usuario**: ID, nombre, email, rol
- **Contexto**: IP, User-Agent, timestamp
- **Datos**: Request/Response sanitizados
- **Resultado**: Status code, duración

### 📈 Monitoreo

#### Logs de Seguridad por Nivel:
- **HIGH**: Errores 403, 404, 500
- **MEDIUM**: Errores 400, 401
- **ALL**: Todas las operaciones

#### Métricas Disponibles:
- Actividad por usuario
- Acciones más frecuentes
- Patrones de acceso
- Detección de anomalías

### ⚙️ Configuración

#### Variables de Entorno Requeridas:
```bash
# Clave de encriptación (32 caracteres mínimo)
ENCRYPTION_KEY="MUST_SET_IN_ENV"

# Base de datos (ya configurada)
DATABASE_URL="postgresql://..."

# Clerk (ya configurado)
CLERK_SECRET_KEY="sk_test_..."
```

### 🔍 Validaciones de Seguridad

#### 1. **Validación de Permisos**
```javascript
// Solo admin y fisioterapeuta pueden acceder
requireClerkRole(['admin', 'fisioterapeuta'])

// Fisioterapeutas solo ven sus pacientes asignados
validateAntecedentesPermissions
```

#### 2. **Validación de Datos**
```javascript
// Detección de contenido malicioso
validateDataIntegrity

// Sanitización de datos sensibles
sanitizeRequestBody
```

#### 3. **Rate Limiting**
```javascript
// Límites por tipo de operación
rateLimitMiddleware(maxRequests, windowMs)
```

### 📋 Tabla de Auditoría

La tabla `auditoria_antecedentes` almacena:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int | ID único |
| `accion` | String | CREAR, ACTUALIZAR, CONSULTAR, ELIMINAR |
| `recurso` | String | ANTECEDENTES_CLINICOS |
| `recursoId` | Int | ID del paciente |
| `metodo` | String | GET, POST, PUT, DELETE |
| `url` | String | URL completa |
| `statusCode` | Int | Código de respuesta HTTP |
| `usuarioId` | Int | ID del usuario en BD |
| `usuarioInfo` | Json | Info del usuario de Clerk |
| `ipAddress` | String | IP del cliente |
| `userAgent` | String | User-Agent del cliente |
| `timestamp` | DateTime | Fecha y hora |
| `detalles` | Json | Request/Response sanitizados |

### 🚀 Uso en Producción

#### 1. **Configurar Variables de Entorno**
```bash
# Generar clave de encriptación segura
ENCRYPTION_KEY=$(openssl rand -base64 32)
```

#### 2. **Monitoreo Recomendado**
- Revisar logs de auditoría regularmente
- Configurar alertas para errores de seguridad
- Monitorear patrones de acceso anómalos

#### 3. **Mantenimiento**
- Rotar claves de encriptación periódicamente
- Limpiar logs antiguos según política de retención
- Revisar estadísticas de uso

### 🔧 Troubleshooting

#### Error de Encriptación:
```bash
# Verificar que ENCRYPTION_KEY esté configurada
echo $ENCRYPTION_KEY
```

#### Error de Permisos:
```bash
# Verificar que el usuario tenga rol correcto en BD
SELECT * FROM usuarios WHERE clerk_id = 'user_xxx';
```

#### Error de Rate Limiting:
```bash
# Los límites son por IP/usuario
# Revisar logs para identificar patrones
```

### 📞 Soporte

Para problemas de seguridad:
1. Revisar logs de auditoría
2. Verificar configuración de ENV
3. Consultar documentación de Clerk
4. Contactar al administrador del sistema

---

**⚠️ IMPORTANTE**: Esta implementación cumple con estándares de seguridad para datos médicos sensibles. No modificar sin revisión de seguridad.
