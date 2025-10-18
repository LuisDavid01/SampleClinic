# Script PowerShell para iniciar la aplicación en Windows
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FISIOTERAPEUTA API - WINDOWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Iniciando servicios con Docker Compose..." -ForegroundColor Green
Write-Host ""

# Verificar si Docker está ejecutándose
try {
    docker version | Out-Null
    Write-Host "✅ Docker está ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está ejecutándose" -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop y vuelve a intentar" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
docker-compose -f docker-compose.windows.yaml down

# Construir y ejecutar
Write-Host "🔨 Construyendo e iniciando servicios..." -ForegroundColor Green
docker-compose -f docker-compose.windows.yaml up --build

Write-Host ""
Write-Host "✅ Servicios iniciados correctamente" -ForegroundColor Green
Write-Host "📊 API disponible en: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🗄️  Base de datos disponible en: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Read-Host "Presiona Enter para continuar"
