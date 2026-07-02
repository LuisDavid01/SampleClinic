FROM node:20 AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:20 AS builder
ENV TZ=America/Costa_Rica
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

RUN npx prisma generate

COPY . .


FROM gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

ENV TZ=America/Costa_Rica
ENV DATABASE_URL "test"
ENV JWT_SECRET=your-unique-jwt-secret-here
ENV JWT_EXPIRES_IN=7d

# Clerk Authentication
ENV CLERK_SECRET_KEY=sk_test_demo
ENV CLERK_PUBLISHABLE_KEY=pk_test_demo


# CORS
ENV CORS_ORIGIN=http://localhost:3000

ENV ENCRYPTION_KEY=your-unique-32-char-encryption-key-here

# Email Configuration
ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=587
ENV SMTP_SECURE=false
ENV SMTP_USER=tu-email@gmail.com
ENV SMTP_PASS=tu-app-password
ENV EMAIL_FROM=noreply@clinicaestebanporras.com
ENV EMAIL_FROM_NAME="Clínica Esteban Porras"

# Frontend URL
ENV FRONTEND_URL=http://localhost:3000

# Configuración de Recordatorios
ENV RECORDATORIO_DIAS_ANTES=2
ENV CRON_SCHEDULE_RECORDATORIOS="0 9 * * *"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json


EXPOSE 3001
CMD ["src/index.js"]
