# Instrucciones para ejecutar el API con Docker

## Prerrequisitos

1. **Docker Desktop debe estar ejecutándose**
   - Abre Docker Desktop desde Aplicaciones
   - Espera a que aparezca el ícono de Docker en la barra de menú
   - Verifica que esté ejecutándose con: `docker ps`

## Comandos para ejecutar

### 1. Iniciar Docker Desktop
```bash
# Abre Docker Desktop desde Aplicaciones o ejecuta:
open -a Docker
```

### 2. Verificar que Docker esté ejecutándose
```bash
docker ps
```

### 3. Ejecutar el API y la base de datos
```bash
cd /Users/adrianmorales/NoSync/fisioterapeuta-ep/clinica-api
docker compose up -d
```

### 4. Verificar que los servicios estén ejecutándose
```bash
docker compose ps
```

### 5. Ver logs del API
```bash
docker compose logs -f clinica-api
```

### 6. Ver logs de la base de datos
```bash
docker compose logs -f postgres
```

## Verificación de funcionamiento

Una vez que los contenedores estén ejecutándose:

1. **API Health Check**: http://localhost:3001/api/health
2. **Documentación Swagger**: http://localhost:3001/api-docs
3. **Base de datos**: localhost:5432

## Comandos útiles

### Parar los servicios
```bash
docker compose down
```

### Parar y eliminar volúmenes (CUIDADO: elimina datos)
```bash
docker compose down -v
```

### Reconstruir los contenedores
```bash
docker compose up --build -d
```

### Acceder al contenedor del API
```bash
docker compose exec clinica-api sh
```

### Acceder a la base de datos
```bash
docker compose exec postgres psql -U postgres -d salena_fisio
```

## Solución de problemas

### Error: "Cannot connect to the Docker daemon"
- Asegúrate de que Docker Desktop esté ejecutándose
- Reinicia Docker Desktop si es necesario

### Error: "Port already in use"
- Verifica que no tengas otros servicios ejecutándose en los puertos 3001 o 5432
- Cambia los puertos en docker-compose.yaml si es necesario

### El API no puede conectar a la base de datos
- Verifica que el contenedor de PostgreSQL esté ejecutándose: `docker compose ps`
- Revisa los logs: `docker compose logs postgres`
