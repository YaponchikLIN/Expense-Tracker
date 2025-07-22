import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Включаем CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Expense Tracker API')
    .setDescription('API для трекера расходов')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Аутентификация', 'Регистрация, вход и управление токенами')
    .addTag('Пользователи', 'Управление профилем пользователя')
    .addTag('Категории', 'Управление категориями расходов')
    .addTag('Транзакции', 'Управление транзакциями')
    .addTag('Отчеты', 'Аналитика и отчеты')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Приложение запущено на http://localhost:${port}`);
  console.log(`📚 Swagger документация доступна на http://localhost:${port}/api`);
}

bootstrap();
