# Integración de Clerk con el API

Este documento explica cómo usar la autenticación de Clerk en el API de la clínica fisioterapéutica.

## Configuración

### Variables de Entorno

Agregar las siguientes variables al archivo `.env`:

```env
# Clerk Authentication
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Docker Compose

Las variables de Clerk ya están configuradas en `docker-compose.yaml`:

```yaml
environment:
  CLERK_SECRET_KEY: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  CLERK_PUBLISHABLE_KEY: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Endpoints Disponibles

### 1. Health Check
```http
GET /api/health
```
No requiere autenticación.

### 2. Test de Autenticación Clerk
```http
GET /api/test-clerk-auth
Authorization: Bearer <clerk_jwt_token>
```

### 3. Perfil de Usuario Clerk
```http
GET /api/clerk/profile
Authorization: Bearer <clerk_jwt_token>
```

### 4. Sincronización de Usuario
```http
POST /api/clerk/sync
Authorization: Bearer <clerk_jwt_token>
```

## Uso en el Frontend

### 1. Obtener Token de Clerk

En tu aplicación Next.js con Clerk:

```javascript
import { useAuth } from '@clerk/nextjs';

function MyComponent() {
  const { getToken } = useAuth();
  
  const token = await getToken();
  
  return token;
}
```

### 2. Hacer Requests al API

```javascript
const token = await getToken();

const response = await fetch('http://localhost:3001/api/clerk/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## Middleware Disponible

### 1. `clerkAuth`
Middleware obligatorio que valida tokens de Clerk.

```javascript
const { clerkAuth } = require('./middleware/clerkAuth');
app.get('/protected', clerkAuth, (req, res) => {
  // req.user contiene información del usuario de Clerk
});
```

### 2. `optionalClerkAuth`
Middleware opcional que no falla si no hay token.

```javascript
const { optionalClerkAuth } = require('./middleware/clerkAuth');
app.get('/optional', optionalClerkAuth, (req, res) => {
  // req.user puede ser null
});
```

### 3. `requireClerkRole`
Middleware para verificar roles específicos.

```javascript
const { requireClerkRole } = require('./middleware/clerkAuth');
app.get('/admin', clerkAuth, requireClerkRole(['admin']), (req, res) => {
  // Solo usuarios con rol 'admin'
});
```

## Sincronización con Base de Datos

El API sincroniza automáticamente los usuarios de Clerk con la base de datos local:

1. **Primera vez**: Se crea un nuevo usuario en la tabla `usuarios`
2. **Siguientes veces**: Se actualiza la información del usuario existente
3. **Campo `clerk_id`**: Se almacena el ID único de Clerk
4. **Roles**: Se determinan automáticamente basados en metadatos de Clerk

### Mapeo de Roles

```javascript
const roleMapping = {
  'admin': 1,      // admin
  'medico': 2,       // medico  
  'paciente': 3      // paciente
};
```

## Estructura de Respuesta

### Usuario de Clerk
```json
{
  "id": "user_2abc123def456",
  "email": "usuario@ejemplo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "sessionId": "sess_2abc123def456",
  "metadata": {}
}
```

### Usuario de Base de Datos
```json
{
  "idUsuario": 1,
  "nombre": "Juan",
  "apellido1": "Pérez",
  "correoElectronico": "usuario@ejemplo.com",
  "clerkId": "user_2abc123def456",
  "rol": {
    "idRol": 2,
    "nombreRol": "medico"
  }
}
```

## Migración de Base de Datos

Se agregó la columna `clerk_id` a la tabla `usuarios`:

```sql
ALTER TABLE usuarios ADD COLUMN clerk_id VARCHAR(100) UNIQUE;
CREATE INDEX idx_usuarios_clerk_id ON usuarios(clerk_id);
```

## Testing

### 1. Sin Token
```bash
curl http://localhost:3001/api/test-clerk-auth
# Respuesta: {"error":"Token de autorización requerido"}
```

### 2. Con Token Válido
```bash
curl -H "Authorization: Bearer <clerk_jwt_token>" \
     http://localhost:3001/api/test-clerk-auth
# Respuesta: Información del usuario autenticado
```

## Solución de Problemas

### Error: "Token de autorización requerido"
- Verificar que el header `Authorization` esté presente
- Verificar que el token comience con `Bearer `

### Error: "Token inválido"
- Verificar que `CLERK_SECRET_KEY` esté configurado correctamente
- Verificar que el token no haya expirado
- Verificar que el token sea válido en Clerk

### Error: "Usuario de Clerk no encontrado"
- Verificar que el middleware `clerkAuth` esté aplicado
- Verificar que el token sea válido

## Próximos Pasos

1. **Configurar roles en Clerk**: Agregar roles en los metadatos de usuario
2. **Migrar endpoints existentes**: Reemplazar autenticación JWT con Clerk
3. **Configurar webhooks**: Para sincronización automática de usuarios
4. **Implementar permisos**: Basados en roles de Clerk
