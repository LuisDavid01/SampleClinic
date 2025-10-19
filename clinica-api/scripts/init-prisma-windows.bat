@echo off
REM Script de inicialización para Windows (CMD)
echo 🚀 Iniciando configuración automática de Prisma (Windows CMD)...

REM Esperar a que PostgreSQL esté listo
echo ⏳ Esperando a que PostgreSQL esté disponible...
:wait_postgres
docker exec fisio_postgres_windows pg_isready -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL no está listo aún, esperando...
    timeout /t 2 /nobreak >nul
    goto wait_postgres
)

echo ✅ PostgreSQL está disponible

REM Generar el cliente de Prisma
echo 🔧 Generando cliente de Prisma...
docker exec fisio_api_windows npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error generando cliente de Prisma
    exit /b 1
)

REM Aplicar migraciones
echo 📊 Aplicando migraciones de la base de datos...
docker exec fisio_api_windows npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ Error aplicando migraciones
    exit /b 1
)

REM Verificar sincronización
echo 🔍 Verificando sincronización de la base de datos...
docker exec fisio_api_windows npx prisma db push --accept-data-loss
if %errorlevel% neq 0 (
    echo ❌ Error en sincronización
    exit /b 1
)

echo ✅ Base de datos inicializada correctamente
echo 🚀 Iniciando aplicación...
docker exec fisio_api_windows npm start
