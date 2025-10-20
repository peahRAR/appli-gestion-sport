import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import loadSecrets from './config/configuration';

async function bootstrap() {
  const secrets = await loadSecrets();
  const app = await NestFactory.create(AppModule.forRoot(secrets), {
    logger: ['log', 'error', 'warn', 'debug'],
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