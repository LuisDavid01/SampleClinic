@echo off
echo ========================================
echo   FISIOTERAPEUTA API - WINDOWS
echo ========================================
echo.

echo 🚀 Iniciando servicios con Docker Compose...
echo.

REM Verificar si Docker está ejecutándose
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está ejecutándose
    echo Por favor, inicia Docker Desktop y vuelve a intentar
    pause
    exit /b 1
)

REM Detener contenedores existentes
echo 🛑 Deteniendo contenedores existentes...
docker-compose -f docker-compose.windows.yaml down

REM Construir y ejecutar
echo 🔨 Construyendo e iniciando servicios...
docker-compose -f docker-compose.windows.yaml up --build

echo.
echo ✅ Servicios iniciados correctamente
echo 📊 API disponible en: http://localhost:3001
echo 🗄️  Base de datos disponible en: localhost:5432
echo.
pause
