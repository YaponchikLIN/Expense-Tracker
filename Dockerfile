# Dockerfile для production сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production образ
FROM node:18-alpine AS production

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Копируем собранное приложение
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]