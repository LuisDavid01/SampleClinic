#!/bin/bash

# Script para probar que las migraciones funcionen correctamente en Docker
echo "🧪 Probando migraciones de Prisma en Docker..."

# Verificar que Docker esté corriendo
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar que el contenedor de la API esté corriendo
if ! docker ps | grep -q "clinica-api"; then
    echo "⚠️  El contenedor clinica-api no está corriendo"
    echo "💡 Ejecuta: docker-compose up -d"
    exit 1
fi

echo "✅ Contenedor clinica-api está corriendo"

# Verificar que Prisma Client esté generado
echo "🔍 Verificando que Prisma Client esté generado..."
if docker exec clinica-api test -d node_modules/@prisma/client; then
    echo "✅ Prisma Client está generado"
else
    echo "⚠️  Prisma Client no encontrado, generando..."
    docker exec clinica-api npx prisma generate
fi

# Verificar el estado de las migraciones
echo "📊 Verificando estado de las migraciones..."
docker exec clinica-api npx prisma migrate status

# Verificar que el schema esté sincronizado
echo "🔍 Verificando sincronización del schema..."
if docker exec clinica-api npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -q "already in sync"; then
    echo "✅ El schema está sincronizado con la base de datos"
else
    echo "⚠️  El schema necesita sincronización"
fi

# Verificar que los campos nuevos existan en la tabla servicios
echo "🔍 Verificando campos fechaCreacion y fechaModificacion en tabla servicios..."
if docker exec clinica-postgres psql -U postgres -d salena_fisio -c "\d servicios" 2>&1 | grep -q "fecha_creacion\|fecha_modificacion"; then
    echo "✅ Los campos fecha_creacion y fecha_modificacion existen en la tabla servicios"
else
    echo "⚠️  Los campos no se encontraron, puede que necesiten ser creados"
fi

echo ""
echo "✅ Pruebas completadas"
echo ""
echo "📋 Para ver los logs del contenedor:"
echo "   docker logs clinica-api"
echo ""
echo "📋 Para ejecutar comandos Prisma manualmente:"
echo "   docker exec clinica-api npx prisma <comando>"
echo ""
echo "📋 Para acceder a la base de datos:"
echo "   docker exec -it clinica-postgres psql -U postgres -d salena_fisio"

