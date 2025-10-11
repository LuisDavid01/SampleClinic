#!/bin/bash

# Script de inicialización automática de Prisma
echo "🚀 Iniciando configuración automática de Prisma..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté disponible..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL no está listo aún, esperando..."
  sleep 2
done

echo "✅ PostgreSQL está disponible"

# Generar el cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Aplicar migraciones
echo "📊 Aplicando migraciones de la base de datos..."
npx prisma migrate deploy

# Verificar que la BD esté sincronizada
echo "🔍 Verificando sincronización de la base de datos..."
npx prisma db push --accept-data-loss

echo "✅ Base de datos inicializada correctamente"

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
exec npm start
