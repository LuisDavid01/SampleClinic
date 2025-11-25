# 📚 Documentación de la API - Clínica Esteban Porras

Este directorio contiene toda la documentación técnica y guías de uso de la API de la clínica fisioterapéutica.

## 📋 Índice de Documentación

### 🚀 Guías de Inicio Rápido

- **[README.md](../README.md)** - Documentación principal del proyecto (en la raíz)
- **[README-WINDOWS.md](./README-WINDOWS.md)** - Guía de instalación específica para Windows
- **[DOCKER.md](./DOCKER.md)** - Guía completa de Docker y contenedores
- **[DOCKER-MIGRATIONS.md](./DOCKER-MIGRATIONS.md)** - Guía de migraciones de base de datos con Docker
- **[DOCKER-RECORDATORIOS.md](./DOCKER-RECORDATORIOS.md)** - Guía específica para sistema de recordatorios en Docker

### 🔧 Configuración y Setup

- **[RECORDATORIOS-SETUP.md](./RECORDATORIOS-SETUP.md)** - Configuración del sistema de recordatorios por email
- **[CLERK_INTEGRATION.md](./Guias_usuario/CLERK_INTEGRATION.md)** - Integración con Clerk para autenticación
- **[INSTRUCCIONES-DOCKER.md](./Guias_usuario/INSTRUCCIONES-DOCKER.md)** - Instrucciones detalladas de Docker

### 📡 Documentación de API

- **[SWAGGER.md](./SWAGGER.md)** - Documentación de Swagger UI y acceso a la API interactiva
- **[ENDPOINTS-CITAS-DETALLES.md](./ENDPOINTS-CITAS-DETALLES.md)** - Documentación completa de endpoints de citas
- **[FILES_API.md](./FILES_API.md)** - Documentación del sistema de gestión de archivos
- **[EVALUACIONES-DIAGNOSTICO-README.md](./EVALUACIONES-DIAGNOSTICO-README.md)** - Documentación de evaluaciones y diagnósticos

### 🔒 Seguridad

- **[SECURITY.md](./SECURITY.md)** - Políticas de seguridad y mejores prácticas

### 📊 Reportes y Validaciones

- **[VALIDACION-CITAS-REPORTE.md](./VALIDACION-CITAS-REPORTE.md)** - Reporte de validación de base de datos para citas

### 📁 Guías de Usuario

La carpeta `Guias_usuario/` contiene guías específicas para usuarios:

- **[CLERK_INTEGRATION.md](./Guias_usuario/CLERK_INTEGRATION.md)** - Integración con Clerk
- **[GUIA-SERVIR-ARCHIVOS.md](./Guias_usuario/GUIA-SERVIR-ARCHIVOS.md)** - Guía para servir archivos
- **[DOCUMENTACION-SWAGGER-ARCHIVOS.md](./Guias_usuario/DOCUMENTACION-SWAGGER-ARCHIVOS.md)** - Documentación Swagger para archivos
- **[FILES_API.md](./FILES_API.md)** - API de archivos (ubicado en la raíz de documentacion/)

### 🧪 Pruebas

- **[tests/README.md](../tests/README.md)** - Documentación de la suite de pruebas (en carpeta tests/)
- **[tests/PRUEBAS-EXPEDIENTES.md](../tests/PRUEBAS-EXPEDIENTES.md)** - Pruebas específicas de expedientes (en carpeta tests/)
- **[PRUEBAS-EXPEDIENTES-OLD.md](./PRUEBAS-EXPEDIENTES-OLD.md)** - Versión anterior de pruebas (archivo histórico)

## 🗂️ Estructura de Carpetas

```
clinica-api/
├── README.md                    # Documentación principal
├── documentacion/               # Esta carpeta
│   ├── README.md               # Este archivo (índice)
│   ├── Guias_usuario/          # Guías específicas de usuario
│   └── [otros archivos .md]    # Resto de documentación
└── tests/
    ├── README.md               # Documentación de pruebas
    └── PRUEBAS-EXPEDIENTES.md  # Pruebas de expedientes
```

## 🔍 Cómo Usar Esta Documentación

1. **Para empezar**: Lee el [README.md](../README.md) principal
2. **Para configurar**: Consulta las guías de setup según tu sistema operativo
3. **Para usar la API**: Revisa [SWAGGER.md](./SWAGGER.md) y los documentos de endpoints
4. **Para desarrollo**: Consulta las guías de integración y seguridad
5. **Para pruebas**: Revisa la documentación en la carpeta `tests/`

## 📝 Notas

- La documentación principal del proyecto se mantiene en `README.md` en la raíz
- Los archivos en `tests/` permanecen en su ubicación original por organización
- Los archivos marcados como `-OLD.md` son versiones históricas mantenidas como referencia

## 🔄 Actualización de Documentación

Si creas nueva documentación:
1. Colócala en esta carpeta `documentacion/`
2. Actualiza este índice (`README.md`)
3. Mantén nombres descriptivos y consistentes
4. Usa formato Markdown estándar

