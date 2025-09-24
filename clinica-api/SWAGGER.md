# Documentación Swagger - API Clínica Fisioterapéutica

## 📚 Información General

Esta API está documentada con Swagger UI usando OpenAPI 3.0. La documentación interactiva está disponible en:

**URL de Swagger UI**: `http://localhost:3001/api-docs`

## 🚀 Acceso a la Documentación

### 1. Iniciar el Servidor
```bash
cd clinica-api
npm install
npm run dev
```

### 2. Abrir Swagger UI
Navegar a: `http://localhost:3001/api-docs`

## 🔧 Características de Swagger

### Documentación Interactiva
- **Pruebas en vivo**: Ejecutar requests directamente desde la interfaz
- **Autenticación JWT**: Botón "Authorize" para agregar tokens
- **Esquemas de datos**: Modelos completos de todas las entidades
- **Ejemplos**: Requests y responses de ejemplo
- **Validación**: Validación automática de datos de entrada

### Organización por Tags
- **Autenticación**: Login, registro, refresh token
- **Usuarios**: Gestión de usuarios del sistema
- **Citas**: Gestión de citas médicas
- **Servicios**: Servicios de la clínica
- **Perfiles**: Perfiles profesionales de médicos
- **Historias de Éxito**: Testimonios y casos de éxito
- **Sistema**: Health check y endpoints del sistema

## 🔐 Autenticación en Swagger

### 1. Obtener Token
1. Ir a la sección **Autenticación**
2. Usar el endpoint `POST /auth/login`
3. Proporcionar credenciales válidas
4. Copiar el token de la respuesta

### 2. Autorizar Requests
1. Hacer clic en el botón **"Authorize"** (🔒)
2. Pegar el token en el formato: `Bearer tu_token_aqui`
3. Hacer clic en **"Authorize"**
4. Cerrar el modal

### 3. Probar Endpoints Protegidos
Ahora todos los endpoints protegidos funcionarán automáticamente con el token.

## 📋 Endpoints Documentados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuario
- `POST /auth/refresh` - Renovar token

### Usuarios
- `GET /usuarios` - Listar usuarios (admin)
- `GET /usuarios/{id}` - Obtener usuario por ID
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Desactivar usuario (admin)
- `GET /usuarios/{id}/citas` - Citas del usuario

### Citas
- `GET /citas` - Listar citas
- `GET /citas/{id}` - Obtener cita por ID
- `POST /citas` - Crear cita
- `PUT /citas/{id}` - Actualizar cita
- `DELETE /citas/{id}` - Cancelar cita
- `POST /citas/{id}/notas` - Agregar nota
- `POST /citas/{id}/resultados` - Agregar resultado

### Servicios
- `GET /servicios` - Listar servicios
- `GET /servicios/{id}` - Obtener servicio por ID
- `POST /servicios` - Crear servicio (admin)
- `PUT /servicios/{id}` - Actualizar servicio (admin)
- `DELETE /servicios/{id}` - Desactivar servicio (admin)

### Perfiles
- `GET /perfiles` - Listar perfiles
- `GET /perfiles/{id}` - Obtener perfil por ID
- `POST /perfiles` - Crear perfil
- `PUT /perfiles/{id}` - Actualizar perfil
- `DELETE /perfiles/{id}` - Eliminar perfil

### Historias de Éxito
- `GET /historias-exito` - Listar historias
- `GET /historias-exito/{id}` - Obtener historia por ID
- `POST /historias-exito` - Crear historia
- `PUT /historias-exito/{id}` - Actualizar historia
- `DELETE /historias-exito/{id}` - Eliminar historia

### Sistema
- `GET /health` - Health check

## 🧪 Pruebas con Swagger

### Ejemplo de Flujo Completo

1. **Registrar Usuario**
   - Ir a `POST /auth/register`
   - Completar el formulario con datos de ejemplo
   - Ejecutar el request
   - Copiar el token de la respuesta

2. **Autorizar en Swagger**
   - Hacer clic en "Authorize"
   - Pegar el token
   - Autorizar

3. **Crear una Cita**
   - Ir a `POST /citas`
   - Usar el ID del usuario creado
   - Completar los datos de la cita
   - Ejecutar el request

4. **Verificar la Cita**
   - Ir a `GET /citas`
   - Ejecutar para ver la cita creada

### Datos de Ejemplo

#### Usuario de Prueba
```json
{
  "nombre": "Juan",
  "apellido1": "Pérez",
  "apellido2": "García",
  "correoElectronico": "juan@ejemplo.com",
  "contrasena": "password123",
  "telefonoPrincipal": "555-1234",
  "direccionResidencia": "Calle 123, Ciudad"
}
```

#### Cita de Prueba
```json
{
  "fechaCita": "2024-01-20",
  "idPaciente": 1,
  "idMedico": 2,
  "idServicio": 1,
  "descripcion": "Consulta inicial",
  "estadoCita": "programada"
}
```

## 🔧 Configuración Técnica

### Dependencias
```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0"
}
```

### Archivos de Configuración
- `src/config/swagger.js` - Configuración principal de Swagger
- `src/index.js` - Integración con Express
- `src/routes/*.js` - Documentación de endpoints

### Esquemas Definidos
- **Usuario**: Modelo completo de usuario
- **Rol**: Sistema de roles
- **Cita**: Gestión de citas
- **Servicio**: Servicios de la clínica
- **Perfil**: Perfiles profesionales
- **HistoriaExito**: Testimonios
- **Error**: Respuestas de error
- **Pagination**: Paginación

## 🎨 Personalización

### Estilos CSS
La interfaz de Swagger está personalizada con CSS:
```css
.swagger-ui .topbar { display: none }
```

### Configuración Avanzada
```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Clínica Fisioterapéutica'
}));
```

## 🚨 Solución de Problemas

### Error: "Cannot find module 'swagger-jsdoc'"
```bash
npm install swagger-jsdoc swagger-ui-express
```

### Error: "Swagger UI not loading"
1. Verificar que el servidor esté ejecutándose
2. Verificar la URL: `http://localhost:3001/api-docs`
3. Revisar logs del servidor

### Error: "Authentication failed"
1. Verificar que el token sea válido
2. Verificar formato: `Bearer token_aqui`
3. Verificar que el token no haya expirado

### Error: "CORS policy"
1. Verificar configuración de CORS en `src/index.js`
2. Verificar que `CORS_ORIGIN` esté configurado correctamente

## 📊 Métricas y Monitoreo

### Logs de Swagger
Los requests desde Swagger UI se registran en los logs del servidor:
```
POST /api/auth/login 200 45ms
GET /api/usuarios 200 23ms
```

### Performance
- Swagger UI se carga una sola vez
- Los requests son reales a la API
- No hay overhead significativo

## 🔄 Actualizaciones

### Agregar Nuevo Endpoint
1. Crear la ruta en el archivo correspondiente
2. Agregar documentación Swagger con `@swagger`
3. Reiniciar el servidor
4. Verificar en Swagger UI

### Modificar Esquema
1. Actualizar en `src/config/swagger.js`
2. Reiniciar el servidor
3. Verificar cambios en Swagger UI

## 📚 Recursos Adicionales

### Documentación Oficial
- [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express)
- [Swagger JSDoc](https://www.npmjs.com/package/swagger-jsdoc)
- [OpenAPI Specification](https://swagger.io/specification/)

### Ejemplos de Uso
- Ver archivos de rutas para ejemplos de documentación
- Usar la interfaz de Swagger para pruebas interactivas
- Consultar logs del servidor para debugging

---

**Fecha de creación**: $(date)
**Versión**: 1.0.0
**Última actualización**: $(date)
