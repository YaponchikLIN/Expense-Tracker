# Expense Tracker API

Современное REST API для трекинга личных расходов, построенное на NestJS с TypeScript.

## Особенности

- **Аутентификация**: JWT токены с refresh механизмом
- **Управление пользователями**: Регистрация, профиль, безопасность
- **Категории**: Создание и управление категориями расходов
- **Транзакции**: CRUD операции с фильтрацией и пагинацией
- **Аналитика**: Детальные отчеты и статистика
- **API документация**: Автоматическая Swagger документация
- **Валидация**: Строгая валидация входящих данных
- **База данных**: PostgreSQL с TypeORM

## Технологический стек

- **Backend**: NestJS, TypeScript
- **База данных**: PostgreSQL
- **ORM**: TypeORM
- **Аутентификация**: JWT, Passport
- **Валидация**: class-validator, class-transformer
- **Документация**: Swagger/OpenAPI
- **Хеширование**: bcryptjs

## Требования

- Node.js 18+
- PostgreSQL 12+
- npm или yarn

## Быстрый старт

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd expense-tracker
npm install
```

### 2. Настройка базы данных

Создайте базу данных PostgreSQL:

```sql
CREATE DATABASE expense_tracker;
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте:

```bash
cp .env.example .env
```

Основные переменные:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=expense_tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 4. Запуск приложения

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## API Документация

После запуска приложения, Swagger документация доступна по адресу:
`http://localhost:3000/api`

## Основные эндпоинты

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/refresh` - Обновление токена
- `POST /auth/logout` - Выход
- `GET /auth/profile` - Профиль пользователя

### Категории
- `GET /categories` - Список категорий
- `POST /categories` - Создание категории
- `PUT /categories/:id` - Обновление категории
- `DELETE /categories/:id` - Удаление категории

### Транзакции
- `GET /transactions` - Список транзакций (с фильтрацией)
- `POST /transactions` - Создание транзакции
- `PUT /transactions/:id` - Обновление транзакции
- `DELETE /transactions/:id` - Удаление транзакции
- `GET /transactions/summary` - Сводка по транзакциям

### Отчеты
- `GET /reports/monthly` - Месячный отчет
- `GET /reports/yearly` - Годовой отчет
- `GET /reports/date-range` - Отчет за период
- `GET /reports/top-categories` - Топ категории

## 🗄 Структура базы данных

### Users (Пользователи)
- id, email, password, firstName, lastName, createdAt, updatedAt

### Categories (Категории)
- id, name, description, color, icon, isActive, isSystem, userId

### Transactions (Транзакции)
- id, amount, description, date, type, categoryId, userId

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Валидация всех входящих данных
- CORS настроен для безопасности
- Защита от SQL инъекций через TypeORM

## Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

## Скрипты

```bash
npm run start:dev      # Запуск в режиме разработки
npm run start:prod     # Запуск в продакшн режиме
npm run build          # Сборка проекта
npm run lint           # Проверка кода
npm run format         # Форматирование кода
```

