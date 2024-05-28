import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import loadSecrets from './config/configuration';

async function bootstrap() {
  const secrets = await loadSecrets();
  const app = await NestFactory.create(AppModule.forRoot(secrets));
  app.enableCors();
  await app.listen(8080);
}

bootstrap();
