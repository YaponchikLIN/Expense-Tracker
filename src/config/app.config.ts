import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));