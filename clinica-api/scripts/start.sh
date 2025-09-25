#!/bin/sh

echo "🚀 Iniciando API de Clínica Fisioterapéutica..."

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté disponible..."
node scripts/wait-for-db.js

if [ $? -eq 0 ]; then
    echo "✅ Base de datos conectada exitosamente"
    
    # Generar cliente de Prisma si es necesario
    echo "🔧 Generando cliente de Prisma..."
    npx prisma generate
    
    # Iniciar la aplicación
    echo "🚀 Iniciando servidor..."
    exec npm start
else
    echo "❌ Error al conectar con la base de datos"
    exit 1
fi
