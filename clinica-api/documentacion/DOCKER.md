# Dockerización del API de Clínica Fisioterapéutica

Este documento explica cómo ejecutar el API de la clínica usando Docker y Docker Compose.

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose instalado

## Estructura de Archivos Docker

```
clinica-api/
├── Dockerfile              # Configuración del contenedor del API
├── .dockerignore           # Archivos a ignorar en la construcción
├── scripts/
│   ├── docker-init.sql     # Script de inicialización de la base de datos
│   └── wait-for-db.js      # Script para esperar que la DB esté lista
└── DOCKER.md              # Este archivo
```

## Configuración

### Variables de Entorno

El docker-compose.yml incluye las siguientes variables de entorno para el API:

#### Variables Básicas
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token
- `PORT`: Puerto del servidor (3001)
- `NODE_ENV`: Entorno de ejecución (production)
- `CORS_ORIGIN`: Origen permitido para CORS

#### Variables de Email (Requeridas para Recordatorios)
- `SMTP_HOST`: Servidor SMTP (ej: smtp.gmail.com)
- `SMTP_PORT`: Puerto SMTP (ej: 587)
- `SMTP_SECURE`: Si usa SSL/TLS (true/false)
- `SMTP_USER`: Usuario del servidor SMTP
- `SMTP_PASS`: Contraseña o App Password del servidor SMTP
- `EMAIL_FROM`: Email remitente
- `EMAIL_FROM_NAME`: Nombre del remitente

#### Variables de Frontend y Recordatorios
- `FRONTEND_URL`: URL del frontend (para links en emails)
- `RECORDATORIO_DIAS_ANTES`: Días antes de la cita para enviar recordatorio (default: 2)
- `CRON_SCHEDULE_RECORDATORIOS`: Horario del cron job (default: "0 9 * * *" - 9 AM diario)
- `TZ`: Zona horaria para cron jobs (default: America/Costa_Rica)

#### Configuración de Variables

Puedes configurar las variables de dos formas:

1. **Usando archivo .env** (recomendado):
   ```bash
   # Crear archivo .env en la raíz del proyecto
   cp env.example .env
   # Editar .env con tus valores
   ```

2. **Directamente en docker-compose.yaml**:
   Edita el archivo `docker-compose.yaml` y modifica las variables en la sección `environment`

### Base de Datos

- **Imagen**: PostgreSQL 15 Alpine
- **Puerto**: 5432
- **Base de datos**: salena_fisio
- **Usuario**: postgres
- **Contraseña**: CHANGE_ME_DB_PASSWORD

## Comandos de Docker

### Construir y ejecutar todos los servicios

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

### Ejecutar en segundo plano

```bash
docker-compose up -d --build
```

### Solo el API y la base de datos

```bash
docker-compose up postgres clinica-api
```

### Ver logs del API

```bash
docker-compose logs -f clinica-api
```

### Parar todos los servicios

```bash
docker-compose down
```

### Parar y eliminar volúmenes (CUIDADO: elimina datos)

```bash
docker-compose down -v
```

## Verificación

Una vez que los contenedores estén ejecutándose:

1. **API**: http://localhost:3001
2. **Documentación Swagger**: http://localhost:3001/api-docs
3. **Health Check**: http://localhost:3001/api/health
4. **Base de datos**: localhost:5432

## Sistema de Recordatorios por Email

El sistema de recordatorios está integrado y se ejecuta automáticamente en Docker. Para que funcione correctamente:

### 1. Configurar Variables de Email

Asegúrate de configurar las variables de email en `docker-compose.yaml` o en un archivo `.env`:

```yaml
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: tu-email@gmail.com
SMTP_PASS: tu-app-password
EMAIL_FROM: noreply@clinicaestebanporras.com
FRONTEND_URL: http://localhost:3000
```

### 2. Verificar que el Job se Inicie

Al iniciar el contenedor, deberías ver en los logs:

```
📅 Programando job de recordatorios con cron: 0 9 * * *
✅ Job de recordatorios iniciado correctamente
```

### 3. Ejecutar Recordatorios Manualmente (Testing)

Puedes ejecutar el job manualmente para probar:

```bash
# Desde fuera del contenedor
curl -X POST http://localhost:3001/api/recordatorios/ejecutar

# O desde dentro del contenedor
docker-compose exec clinica-api curl -X POST http://localhost:3001/api/recordatorios/ejecutar
```

### 4. Verificar Migraciones

Las migraciones de Prisma se ejecutan automáticamente al iniciar el contenedor. Verifica que las nuevas tablas existan:

```bash
docker-compose exec postgres psql -U postgres -d salena_fisio -c "\d email_logs"
docker-compose exec postgres psql -U postgres -d salena_fisio -c "\d citas" | grep recordatorio
```

### 5. Ver Logs de Recordatorios

Para ver los logs del sistema de recordatorios:

```bash
docker-compose logs clinica-api | grep -i recordatorio
```

### 6. Configurar Timezone

El timezone se configura automáticamente a `America/Costa_Rica`. Para cambiarlo:

```yaml
environment:
  TZ: America/Mexico_City  # O tu timezone preferido
```

## Solución de Problemas

### El API no puede conectar a la base de datos

1. Verifica que el contenedor de PostgreSQL esté ejecutándose:
   ```bash
   docker-compose ps
   ```

2. Revisa los logs de PostgreSQL:
   ```bash
   docker-compose logs postgres
   ```

3. Verifica que la base de datos se haya inicializado correctamente:
   ```bash
   docker-compose exec postgres psql -U postgres -d salena_fisio -c "\dt"
   ```

### El API se reinicia constantemente

1. Revisa los logs del API:
   ```bash
   docker-compose logs clinica-api
   ```

2. Verifica que todas las dependencias estén instaladas correctamente

### Problemas de permisos

Si tienes problemas con permisos en archivos, ejecuta:

```bash
sudo chown -R $USER:$USER .
```

### Emails no se envían

1. Verifica que las variables SMTP estén configuradas:
   ```bash
   docker-compose exec clinica-api env | grep SMTP
   ```

2. Revisa los logs del servicio de email:
   ```bash
   docker-compose logs clinica-api | grep -i email
   ```

3. Verifica que el job esté ejecutándose:
   ```bash
   docker-compose logs clinica-api | grep -i "job de recordatorios"
   ```

4. Prueba la conexión SMTP manualmente desde el contenedor:
   ```bash
   docker-compose exec clinica-api node -e "const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}}); t.verify().then(() => console.log('✅ SMTP OK')).catch(e => console.error('❌ SMTP Error:', e.message));"
   ```

## Desarrollo

### Modificar el código

1. Realiza los cambios en el código
2. Reconstruye el contenedor:
   ```bash
   docker-compose up --build clinica-api
   ```

### Acceder al contenedor del API

```bash
docker-compose exec clinica-api sh
```

### Acceder a la base de datos

```bash
docker-compose exec postgres psql -U postgres -d salena_fisio
```

## Producción

Para un entorno de producción, considera:

1. Cambiar las credenciales de la base de datos
2. Usar un archivo `.env` para las variables sensibles
3. Configurar un proxy reverso (nginx)
4. Usar certificados SSL
5. Configurar backups de la base de datos

## Estructura de Red

Todos los servicios están en la red `app-network`, lo que permite:

- Comunicación entre contenedores usando nombres de servicio
- Aislamiento de otros contenedores en el host
- Configuración de CORS apropiada

## Volúmenes

- `postgres_data`: Persiste los datos de PostgreSQL
- Los scripts SQL se montan como volúmenes de solo lectura
