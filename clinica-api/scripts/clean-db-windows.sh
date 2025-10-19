#!/bin/bash

# Script para limpiar la base de datos en Windows
echo "🧹 Limpiando base de datos..."

# Función para ejecutar comandos de Prisma
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

# Resetear la base de datos
run_prisma_command "npx prisma migrate reset --force" "Reseteando base de datos"

# Aplicar el schema
run_prisma_command "npx prisma db push" "Aplicando schema a la base de datos"

echo "✅ Base de datos limpiada y lista"
