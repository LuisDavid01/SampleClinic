#!/bin/bash

# Script de inicialización automática de Prisma optimizado para Windows
echo "🚀 Iniciando configuración automática de Prisma (Windows)..."

# Función para verificar si PostgreSQL está listo
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

# Función para ejecutar comandos de Prisma con manejo de errores
run_prisma_command() {
    local command="$1"
    local description="$2"
    
    echo "🔧 $description..."
    if eval "$command"; then
        echo "✅ $description completado"
    else
        echo "❌ Error en: $description"
        exit 1
    fi
}

# Esperar a que PostgreSQL esté listo
wait_for_postgres

# Generar el cliente de Prisma
run_prisma_command "npx prisma generate" "Generando cliente de Prisma"

# Sincronizar la base de datos (más permisivo que migrate)
run_prisma_command "npx prisma db push --accept-data-loss" "Sincronizando la base de datos"

echo "✅ Base de datos inicializada correctamente"

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
exec npm start
