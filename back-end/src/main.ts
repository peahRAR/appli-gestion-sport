import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import loadSecrets from './config/configuration';
import { ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const secrets = await loadSecrets();
  const app = await NestFactory.create(AppModule.forRoot(secrets), {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // ✅ Active la validation des DTO partout (Create/Update)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // API responses must never be cached by a service worker or the browser —
  // this app is a static SPA and the API is the only source of fresh data
  // (relevant now that a service worker exists, see front-end Lot 8/7).
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  const allowedOrigins = ['http://localhost:3000', 'https://app.mmabaisieux.fr'];

  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  await app.listen(8080);
}
bootstrap();