FROM --platform=linux/amd64 node:20-alpine as deps


RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

copy package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

FROM --platform=linux/amd64 node:20-alpine as builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm && pnpm run build

FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/pacientes
ENV NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/pacientes
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
ENV CLERK_SECRET_KEY=""
ENV NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
ENV NEXT_PUBLIC_CHAT_API_BASE_URL="http://localhost:8081/api"
ENV NEXT_PUBLIC_WS_URL="ws://localhost:8081/ws"

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["server.js"]
