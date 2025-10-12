#!/bin/bash

# Script de ejemplo para ejecutar pruebas de Expedientes
# Asegúrate de que el servidor esté funcionando antes de ejecutar

echo "🧪 Ejecutando pruebas de Expedientes"
echo "======================================"

# Verificar que el servidor esté funcionando
echo "🔍 Verificando servidor..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Servidor funcionando"
else
    echo "❌ Servidor no disponible. Inicia el servidor primero:"
    echo "   npm start"
    echo "   o"
    echo "   docker compose up -d"
    exit 1
fi

echo ""
echo "Selecciona el tipo de prueba:"
echo "1. Pruebas funcionales básicas"
echo "2. Pruebas de integración con Clerk"
echo "3. Pruebas de rendimiento"
echo "4. Ejecutar todas las pruebas"
echo "5. Mostrar tokens para pruebas manuales"
echo "6. Salir"

read -p "Ingresa tu opción (1-6): " choice

case $choice in
    1)
        echo "🧪 Ejecutando pruebas funcionales..."
        node test-expedientes-funcional.js
        ;;
    2)
        echo "🔐 Ejecutando pruebas de Clerk..."
        node test-expedientes-clerk.js
        ;;
    3)
        echo "⚡ Ejecutando pruebas de rendimiento..."
        node test-expedientes-performance.js
        ;;
    4)
        echo "🚀 Ejecutando todas las pruebas..."
        node test-expedientes-all.js all
        ;;
    5)
        echo "🔑 Generando tokens para pruebas manuales..."
        node test-expedientes-tokens.js
        ;;
    6)
        echo "👋 ¡Hasta luego!"
        exit 0
        ;;
    *)
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
echo "✅ Pruebas completadas"
