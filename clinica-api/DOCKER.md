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

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token
- `PORT`: Puerto del servidor (3001)
- `NODE_ENV`: Entorno de ejecución (production)
- `CORS_ORIGIN`: Origen permitido para CORS

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
