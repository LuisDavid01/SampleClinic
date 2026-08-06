FROM node:20-alpine AS deps


RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Z2xvd2luZy1nb2xkZmlzaC05Mi5jbGVyay5hY2NvdW50cy5kZXYk"
ARG NEXT_PUBLIC_API_BASE_URL="http://clinicaapi-service:3001/api"
ARG NEXT_PUBLIC_CHAT_API_BASE_URL="http://clinicachat-service:8081/api"
ARG NEXT_PUBLIC_WS_URL="ws://clinicachat-service:8081/ws"
RUN npm install -g pnpm && pnpm run build

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY ca.crt /usr/local/share/ca-certificates/clinic-internal.crt
RUN update-ca-certificates

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/pacientes
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/pacientes

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
