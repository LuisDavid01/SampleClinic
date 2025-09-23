# API de Clínica Fisioterapéutica

API REST para el sistema de gestión de clínica fisioterapéutica desarrollada con Node.js, Express, Prisma y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** con roles de usuario
- **Sistema de gestión de sesiones** avanzado con control de inactividad
- **Control de sesiones únicas** por usuario para máxima seguridad
- **Limpieza automática** de sesiones expiradas
- **Base de datos PostgreSQL** con Prisma ORM
- **Validación de datos** con express-validator
- **Middleware de seguridad** con helmet y cors
- **Documentación de API** completa con Swagger UI
- **Manejo de errores** robusto
- **Interfaz interactiva** para pruebas de API
- **Auditoría completa** de sesiones con IP y User Agent

## 📋 Requisitos

- Node.js v18 o superior
- PostgreSQL v12 o superior
- npm o pnpm

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd clinica-api
```

2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/salena_fisio?schema=public"
JWT_SECRET="CHANGE_ME"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# Session Management
SESSION_MAX_INACTIVE_TIME="30m"
SESSION_CLEANUP_INTERVAL="5m"
```

4. **Configurar la base de datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# O sincronizar esquema (desarrollo)
npm run db:push
```

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

6. **Acceder a la documentación Swagger**
Navegar a: `http://localhost:3001/api-docs`

## 📊 Estructura de la Base de Datos

### Entidades Principales

- **Usuarios**: Pacientes, médicos y administradores
- **Roles**: Sistema de roles y permisos
- **Perfiles**: Información profesional de los médicos
- **Servicios**: Servicios ofrecidos por la clínica
- **Citas**: Programación y gestión de citas
- **Certificaciones**: Certificaciones profesionales
- **Historias de Éxito**: Testimonios y casos de éxito

### Relaciones

- Un usuario puede tener un perfil (médicos)
- Un perfil puede tener múltiples certificaciones
- Un perfil puede ofrecer múltiples servicios
- Una cita tiene un paciente, médico y opcionalmente un servicio
- Las citas pueden tener notas y resultados
- Las historias de éxito están relacionadas con servicios, médicos y pacientes

## 🔐 Autenticación y Gestión de Sesiones

La API utiliza JWT (JSON Web Tokens) con un sistema avanzado de gestión de sesiones para máxima seguridad.

### Sistema de Sesiones Seguras

#### Características de Seguridad
- **Sesión única por usuario**: Solo una sesión activa permitida
- **Control de inactividad**: Sesiones expiran automáticamente tras 30 minutos de inactividad
- **Limpieza automática**: Sesiones expiradas se eliminan cada 5 minutos
- **Almacenamiento seguro**: Tokens almacenados como hash SHA256
- **Auditoría completa**: Registro de IP, User Agent y timestamps

#### Flujo de Autenticación
1. **Login**: Usuario envía credenciales
2. **Validación**: Verificar credenciales en base de datos
3. **Invalidación**: Invalidar sesiones anteriores del usuario
4. **Creación**: Crear nueva sesión con token JWT
5. **Validación continua**: Verificar sesión en cada request

### Headers de Autenticación

```
Authorization: Bearer <token>
```

### Roles de Usuario

- **Administrador (ID: 1)**: Acceso completo al sistema
- **Fisioterapeuta (ID: 2)**: Gestión de citas y perfiles
- **Recepcionista (ID: 3)**: Gestión de citas y usuarios
- **Paciente (ID: 4)**: Acceso a sus propias citas e historias

## 📚 Documentación de la API

### Swagger UI
La API incluye documentación interactiva completa con Swagger UI:

**URL**: `http://localhost:3001/api-docs`

#### Características de Swagger
- **Pruebas en vivo**: Ejecutar requests directamente desde la interfaz
- **Autenticación JWT**: Botón "Authorize" para agregar tokens
- **Esquemas de datos**: Modelos completos de todas las entidades
- **Ejemplos**: Requests y responses de ejemplo
- **Validación**: Validación automática de datos de entrada

#### Cómo usar Swagger
1. Iniciar el servidor: `npm run dev`
2. Abrir: `http://localhost:3001/api-docs`
3. Para endpoints protegidos:
   - Ir a `POST /auth/login`
   - Proporcionar credenciales
   - Copiar el token de la respuesta
   - Hacer clic en "Authorize" (🔒)
   - Pegar el token: `Bearer tu_token_aqui`
   - Autorizar

### Endpoints de la API

### Autenticación y Sesiones
- `POST /api/auth/login` - Iniciar sesión y crear sesión segura
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión actual
- `GET /api/auth/session/status` - Verificar estado de sesión
- `GET /api/auth/session/sessions` - Obtener sesiones activas del usuario
- `POST /api/auth/session/invalidate-all` - Invalidar todas las sesiones del usuario

### Usuarios
- `GET /api/usuarios` - Listar usuarios (admin)
- `GET /api/usuarios/:id` - Obtener usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Desactivar usuario (admin)
- `GET /api/usuarios/:id/citas` - Citas del usuario

### Citas
- `GET /api/citas` - Listar citas
- `GET /api/citas/:id` - Obtener cita
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `DELETE /api/citas/:id` - Cancelar cita
- `POST /api/citas/:id/notas` - Agregar nota
- `POST /api/citas/:id/resultados` - Agregar resultado

### Servicios
- `GET /api/servicios` - Listar servicios
- `GET /api/servicios/:id` - Obtener servicio
- `POST /api/servicios` - Crear servicio (admin)
- `PUT /api/servicios/:id` - Actualizar servicio (admin)
- `DELETE /api/servicios/:id` - Desactivar servicio (admin)
- `GET /api/servicios/:id/perfiles` - Perfiles que ofrecen el servicio
- `POST /api/servicios/:id/perfiles` - Asociar perfil (admin)
- `DELETE /api/servicios/:id/perfiles/:idPerfil` - Desasociar perfil (admin)

### Perfiles
- `GET /api/perfiles` - Listar perfiles
- `GET /api/perfiles/:id` - Obtener perfil
- `POST /api/perfiles` - Crear perfil
- `PUT /api/perfiles/:id` - Actualizar perfil
- `DELETE /api/perfiles/:id` - Eliminar perfil
- `POST /api/perfiles/:id/certificaciones` - Agregar certificación
- `DELETE /api/perfiles/:id/certificaciones/:idCertificacion` - Remover certificación
- `POST /api/perfiles/:id/servicios` - Agregar servicio
- `DELETE /api/perfiles/:id/servicios/:idServicio` - Remover servicio

### Historias de Éxito
- `GET /api/historias-exito` - Listar historias
- `GET /api/historias-exito/:id` - Obtener historia
- `POST /api/historias-exito` - Crear historia
- `PUT /api/historias-exito/:id` - Actualizar historia
- `DELETE /api/historias-exito/:id` - Eliminar historia
- `POST /api/historias-exito/:id/publicar` - Publicar historia (admin)
- `POST /api/historias-exito/:id/despublicar` - Despublicar historia (admin)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor con nodemon

# Producción
npm start           # Iniciar servidor

# Base de datos
npm run db:generate # Generar cliente Prisma
npm run db:push     # Sincronizar esquema (desarrollo)
npm run db:migrate  # Aplicar migraciones
npm run db:studio   # Abrir Prisma Studio
```

## 🛡️ Seguridad

### Características de Seguridad Implementadas
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de origen cruzado
- **JWT**: Autenticación segura con tokens
- **Sistema de Sesiones**: Control avanzado de sesiones
- **Validación**: Validación de datos de entrada
- **Bcrypt**: Hash seguro de contraseñas
- **Auditoría**: Registro completo de actividad

### Sistema de Gestión de Sesiones
- **Sesión única**: Un solo token activo por usuario
- **Expiración automática**: 30 minutos de inactividad máxima
- **Limpieza automática**: Eliminación de sesiones expiradas
- **Almacenamiento seguro**: Hash SHA256 de tokens
- **Información de auditoría**: IP, User Agent, timestamps
- **Invalidación controlada**: Logout seguro y invalidación masiva

### Códigos de Error de Seguridad
- `401` - Token de acceso requerido
- `401` - Sesión inválida o expirada
- `401` - Sesión inactiva por demasiado tiempo
- `403` - Token inválido o acceso denegado
- `500` - Error interno del servidor

## 📝 Validaciones

La API incluye validaciones robustas para:

- Formato de correo electrónico
- Longitud de contraseñas
- Tipos de datos
- Relaciones entre entidades
- Permisos de usuario

## 🧪 Pruebas del Sistema

### Scripts de Prueba Disponibles

#### Pruebas de Gestión de Sesiones
```bash
# Probar sistema completo de sesiones
node test-session-management.js

# Probar consistencia de roles
node test-roles-consistency.js

# Probar endpoints de servicios en Swagger
node test-servicios-swagger.js

# Probar endpoints de usuarios en Swagger
node test-usuarios-swagger.js
```

#### Funcionalidades Probadas
- ✅ **Login y creación de sesión**: Generación de tokens y sesiones
- ✅ **Verificación de estado**: Validación de sesiones activas
- ✅ **Control de sesiones únicas**: Invalidación automática
- ✅ **Logout seguro**: Cierre de sesiones
- ✅ **Simulación de inactividad**: Expiración por tiempo
- ✅ **Limpieza automática**: Eliminación de sesiones expiradas
- ✅ **APIs de gestión**: Todos los endpoints de sesiones

### Ejemplo de Uso del Sistema de Sesiones

```javascript
// 1. Login y crear sesión
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    correoElectronico: 'usuario@ejemplo.com',
    contrasena: 'password123'
  })
});

const { token } = await loginResponse.json();

// 2. Verificar estado de sesión
const statusResponse = await fetch('/api/auth/session/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const sessionStatus = await statusResponse.json();
console.log('Sesión válida:', sessionStatus.valid);

// 3. Obtener sesiones activas
const sessionsResponse = await fetch('/api/auth/session/sessions', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { sessions } = await sessionsResponse.json();
console.log('Sesiones activas:', sessions.length);

// 4. Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🚨 Manejo de Errores

La API devuelve errores estructurados:

```json
{
  "error": "Tipo de error",
  "message": "Descripción del error",
  "details": [] // Detalles adicionales (opcional)
}
```

### Errores Específicos de Sesiones
```json
{
  "error": "Sesión inválida",
  "message": "Sesión inactiva por demasiado tiempo"
}
```

## 📈 Paginación

Los endpoints de listado incluyen paginación:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔍 Filtros y Búsqueda

Muchos endpoints soportan filtros:

- `search`: Búsqueda por texto
- `page` y `limit`: Paginación
- Filtros específicos por entidad

## 📁 Estructura del Proyecto

```
clinica-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración de Prisma
│   │   ├── env.js              # Variables de entorno
│   │   └── swagger.js          # Configuración de Swagger
│   ├── constants/
│   │   └── roles.js            # Constantes de roles
│   ├── middleware/
│   │   ├── auth.js             # Middleware de autenticación
│   │   └── validation.js       # Validaciones de datos
│   ├── routes/
│   │   ├── auth.js             # Rutas de autenticación y sesiones
│   │   ├── usuarios.js         # Gestión de usuarios
│   │   ├── citas.js            # Gestión de citas
│   │   ├── servicios.js        # Gestión de servicios
│   │   ├── historias-exito.js  # Historias de éxito
│   │   └── perfiles.js         # Perfiles de fisioterapeutas
│   ├── services/
│   │   └── sessionService.js   # Servicio de gestión de sesiones
│   ├── utils/
│   │   ├── jwt.js              # Utilidades JWT
│   │   └── password.js         # Utilidades de contraseñas
│   └── index.js                # Punto de entrada
├── prisma/
│   └── schema.prisma           # Esquema de base de datos
├── scripts/
│   ├── init-db.sql            # Script de inicialización
│   ├── create-sessions-table.sql # Script de tabla de sesiones
│   └── apply-sessions-table.js   # Aplicar tabla de sesiones
├── test-*.js                  # Scripts de prueba
├── package.json
├── .env.example
└── README.md
```

### Archivos Clave del Sistema de Sesiones
- **`src/services/sessionService.js`**: Servicio principal de gestión de sesiones
- **`src/middleware/auth.js`**: Middleware actualizado con validación de sesiones
- **`src/routes/auth.js`**: Endpoints de autenticación y gestión de sesiones
- **`prisma/schema.prisma`**: Modelo de datos con tabla de sesiones
- **`test-session-management.js`**: Script de pruebas completo

## 📱 Uso con Frontend

Esta API está diseñada para trabajar con el frontend Next.js en `clinica-nextjs`. Asegúrate de configurar la URL de la API en el frontend.

### Integración con Frontend
- **Autenticación**: Usar endpoints de login/logout
- **Gestión de sesiones**: Verificar estado de sesión periódicamente
- **Manejo de errores**: Implementar manejo de sesiones expiradas
- **Tokens**: Almacenar tokens de forma segura

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.
