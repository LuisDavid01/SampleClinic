# 🪟 Guía de Instalación para Windows

Esta guía te ayudará a ejecutar la API de Fisioterapeuta en Windows usando Docker.

## 📋 Prerrequisitos

1. **Docker Desktop para Windows**
   - Descargar desde: https://www.docker.com/products/docker-desktop/
   - Instalar y configurar
   - Asegurarse de que esté ejecutándose

2. **Git para Windows** (opcional)
   - Para clonar el repositorio

## 🚀 Instalación Rápida

### Opción 1: Usando el Script Batch (Recomendado)
```cmd
# Ejecutar en CMD o PowerShell
start-windows.bat
```

### Opción 2: Usando PowerShell
```powershell
# Ejecutar en PowerShell
.\start-windows.ps1
```

### Opción 3: Comando Manual
```cmd
# Detener contenedores existentes
docker-compose -f docker-compose.windows.yaml down

# Construir e iniciar
docker-compose -f docker-compose.windows.yaml up --build
```

## 🔧 Archivos Específicos para Windows

- `Dockerfile.windows` - Dockerfile optimizado para Windows
- `docker-compose.windows.yaml` - Configuración de Docker Compose para Windows
- `scripts/init-prisma-windows.sh` - Script de inicialización mejorado
- `start-windows.bat` - Script de inicio para CMD
- `start-windows.ps1` - Script de inicio para PowerShell

## 🌐 Acceso a la Aplicación

Una vez iniciada, la aplicación estará disponible en:
- **API**: http://localhost:3001
- **Base de Datos**: localhost:5432
- **Swagger UI**: http://localhost:3001/api-docs

## 🐛 Solución de Problemas

### Error: "Docker no está ejecutándose"
- Asegúrate de que Docker Desktop esté iniciado
- Verifica que el servicio de Docker esté ejecutándose

### Error: "Permission denied" en scripts
- Los scripts están configurados para ejecutarse dentro de Docker
- No necesitas permisos especiales en Windows

### Error: "Port already in use"
- Detén otros servicios que usen el puerto 3001 o 5432
- O cambia los puertos en `docker-compose.windows.yaml`

### Error: "Script execution policy" en PowerShell
```powershell
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🔄 Comandos Útiles

```cmd
# Ver logs de la aplicación
docker-compose -f docker-compose.windows.yaml logs api

# Ver logs de la base de datos
docker-compose -f docker-compose.windows.yaml logs postgres

# Detener todos los servicios
docker-compose -f docker-compose.windows.yaml down

# Reconstruir desde cero
docker-compose -f docker-compose.windows.yaml down -v
docker-compose -f docker-compose.windows.yaml up --build
```

## 📁 Estructura de Archivos

```
clinica-api/
├── Dockerfile.windows          # Dockerfile para Windows
├── docker-compose.windows.yaml # Docker Compose para Windows
├── start-windows.bat           # Script de inicio CMD
├── start-windows.ps1           # Script de inicio PowerShell
├── scripts/
│   └── init-prisma-windows.sh  # Script de inicialización mejorado
└── README-WINDOWS.md           # Esta guía
```

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. **API respondiendo**:
   ```cmd
   curl http://localhost:3001/api/usuarios
   ```

2. **Base de datos conectada**:
   ```cmd
   docker-compose -f docker-compose.windows.yaml exec postgres psql -U postgres -d salena_fisio -c "SELECT COUNT(*) FROM usuarios;"
   ```

3. **Swagger UI**:
   - Abrir http://localhost:3001/api-docs en el navegador

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que Docker Desktop esté ejecutándose
2. Revisa los logs: `docker-compose -f docker-compose.windows.yaml logs`
3. Asegúrate de que los puertos 3001 y 5432 estén libres
4. Intenta reconstruir: `docker-compose -f docker-compose.windows.yaml up --build`
