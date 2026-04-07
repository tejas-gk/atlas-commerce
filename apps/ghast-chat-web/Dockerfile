# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/ghast-chat-web/package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
RUN pnpm install

COPY apps/ghast-chat-web/src ./src
COPY apps/ghast-chat-web/public ./public
COPY apps/ghast-chat-web/next.config.js ./
COPY apps/ghast-chat-web/tsconfig.json ./
COPY apps/ghast-chat-web/tailwind.config.js ./
COPY apps/ghast-chat-web/postcss.config.js ./

RUN pnpm run build

# ---- Runtime Stage ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./

EXPOSE 3100

CMD ["pnpm", "start"]
