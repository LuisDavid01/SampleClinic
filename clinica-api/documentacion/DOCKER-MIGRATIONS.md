# Guía de Migraciones en Docker

Esta guía explica cómo funcionan las migraciones de Prisma cuando se despliega la aplicación en Docker.

## 🔄 Proceso de Migración Automática

Cuando el contenedor `clinica-api` se inicia, ejecuta automáticamente el script `scripts/init-prisma.sh` que:

1. **Espera a que PostgreSQL esté disponible** (hasta 30 intentos)
2. **Genera el cliente de Prisma** (`prisma generate`)
3. **Intenta aplicar migraciones** (`prisma migrate deploy`)
   - Si las migraciones fallan, usa `prisma db push` como respaldo
4. **Inicializa roles básicos** (si el script existe)
5. **Inicia la aplicación**

## 📋 Comandos Útiles

### Ver logs del contenedor durante el inicio
```bash
docker logs -f clinica-api
```

### Verificar estado de migraciones manualmente
```bash
docker exec clinica-api npx prisma migrate status
```

### Aplicar migraciones manualmente
```bash
docker exec clinica-api npx prisma migrate deploy
```

### Sincronizar schema manualmente (si las migraciones fallan)
```bash
docker exec clinica-api npx prisma db push --accept-data-loss
```

### Regenerar Prisma Client
```bash
docker exec clinica-api npx prisma generate
```

### Ejecutar script de prueba
```bash
./scripts/test-docker-migration.sh
```

## 🧪 Probar Migraciones

### Opción 1: Usar el script de prueba
```bash
cd clinica-api
./scripts/test-docker-migration.sh
```

### Opción 2: Verificar manualmente

1. **Verificar que los contenedores estén corriendo:**
   ```bash
   docker ps | grep -E "clinica-api|clinica-postgres"
   ```

2. **Verificar que el schema esté sincronizado:**
   ```bash
   docker exec clinica-api npx prisma db push --accept-data-loss --skip-generate
   ```
   Debería mostrar: `The database is already in sync with the Prisma schema.`

3. **Verificar campos en la base de datos:**
   ```bash
   docker exec clinica-postgres psql -U postgres -d salena_fisio -c "\d servicios"
   ```
   Deberías ver las columnas `fecha_creacion` y `fecha_modificacion`.

## 🔧 Solución de Problemas

### Error: "Migration failed to apply cleanly"
Si ves este error, el script automáticamente usará `prisma db push` como respaldo. Esto es normal si:
- Es la primera vez que se despliega
- Hay cambios en el schema que no tienen migración correspondiente

### Error: "PostgreSQL no está disponible"
- Verifica que el contenedor de PostgreSQL esté corriendo: `docker ps | grep postgres`
- Verifica los logs: `docker logs clinica-postgres`
- Espera unos segundos más, PostgreSQL puede tardar en iniciar

### Error: "Prisma Client not generated"
El Dockerfile genera el cliente durante el build, pero si necesitas regenerarlo:
```bash
docker exec clinica-api npx prisma generate
```

## 📝 Notas Importantes

- **En desarrollo**: El script usa `prisma db push` como respaldo si las migraciones fallan
- **En producción**: Se recomienda usar solo `prisma migrate deploy` y tener todas las migraciones creadas
- **Cambios en el schema**: Si modificas `schema.prisma`, necesitas:
  1. Crear una migración: `npx prisma migrate dev --name nombre_migracion`
  2. O usar `prisma db push` (solo desarrollo)
  3. Reconstruir la imagen Docker

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo local:**
   ```bash
   npx prisma migrate dev --name nombre_cambio
   ```

2. **Probar en Docker:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   docker logs -f clinica-api
   ```

3. **Verificar que todo funcione:**
   ```bash
   ./scripts/test-docker-migration.sh
   ```

## ✅ Validación de Campos Nuevos

Para verificar que los campos `fechaCreacion` y `fechaModificacion` estén en la tabla `servicios`:

```bash
docker exec clinica-postgres psql -U postgres -d salena_fisio -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'servicios' AND column_name IN ('fecha_creacion', 'fecha_modificacion');"
```

Deberías ver ambas columnas listadas.

