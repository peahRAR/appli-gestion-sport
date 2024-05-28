import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import loadSecrets from './config/configuration';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const secrets = await loadSecrets();

  const app = await NestFactory.create(AppModule);

  // Inject secrets into the ConfigService
  const configService = app.get(ConfigService);
  Object.keys(secrets).forEach(key => {
    configService.set(key, secrets[key]);
  });

  app.enableCors();
  await app.listen(8080);
}

bootstrap();
