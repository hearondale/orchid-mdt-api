FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.prod.ts ./prisma.config.ts

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

RUN pnpm exec prisma generate

COPY . .
RUN pnpm build

# --- Production ---
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --prod && \
    pnpm exec prisma generate

CMD ["node", "dist/src/main"]