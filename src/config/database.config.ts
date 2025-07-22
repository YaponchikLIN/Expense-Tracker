import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // PostgreSQL для продакшена
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'expense_tracker',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: true,
    };
  } else {
    // SQLite для разработки
    return {
      type: 'sqlite',
      database: 'expense_tracker.db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Автоматическая синхронизация схемы в разработке
      logging: true,
    };
  }
});