#!/bin/bash

# Script de inicialización automática de Prisma
echo "🚀 Iniciando configuración automática de Prisma..."

# Función para esperar a PostgreSQL
wait_for_postgres() {
    echo "⏳ Esperando a que PostgreSQL esté disponible..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if pg_isready -h postgres -p 5432 -U postgres >/dev/null 2>&1; then
            echo "✅ PostgreSQL está disponible"
            return 0
        fi
        echo "Intento $attempt/$max_attempts - PostgreSQL no está listo aún, esperando..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Error: PostgreSQL no está disponible después de $max_attempts intentos"
    exit 1
}

# Esperar a que PostgreSQL esté listo
wait_for_postgres

# Generar el cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
if ! npx prisma generate; then
    echo "❌ Error generando cliente de Prisma"
    exit 1
fi

# Intentar aplicar migraciones primero (método preferido para producción)
echo "📊 Intentando aplicar migraciones de la base de datos..."
if npx prisma migrate deploy; then
    echo "✅ Migraciones aplicadas exitosamente"
else
    echo "⚠️  Las migraciones fallaron, usando db push como respaldo..."
    echo "🔍 Sincronizando la base de datos con el schema..."
    if ! npx prisma db push --accept-data-loss; then
        echo "❌ Error sincronizando la base de datos"
        exit 1
    fi
    echo "✅ Base de datos sincronizada exitosamente"
fi

# Inicializar roles básicos si no existen
echo "🔄 Inicializando roles básicos..."
if [ -f "scripts/init-roles.js" ]; then
    node scripts/init-roles.js || echo "⚠️  Advertencia: Error al inicializar roles (puede que ya existan)"
fi

echo "✅ Base de datos inicializada correctamente"

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
exec npm start
