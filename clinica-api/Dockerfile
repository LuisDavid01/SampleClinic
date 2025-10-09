# Usar Node.js 18 como imagen base con Debian para mejor compatibilidad con Prisma
FROM node:18-slim

# Instalar dependencias del sistema necesarias para Prisma y healthcheck
RUN apt-get update && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para Prisma)
RUN npm ci

# Copiar el código fuente
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Hacer ejecutable el script de inicio
RUN chmod +x scripts/start.sh

# Crear usuario no-root para seguridad
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nodejs

# Cambiar la propiedad de los archivos al usuario nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["./scripts/start.sh"]
