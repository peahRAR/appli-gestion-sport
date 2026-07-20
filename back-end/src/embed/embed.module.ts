import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmbedController } from './embed.controller';
import { EmbedAssetsController, EmbedProxyController } from './embed-proxy.controller';
import { EmbedProxyService } from './embed-proxy.service';
import { EmbedSessionGuard } from './embed-session.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmbedController, EmbedProxyController, EmbedAssetsController],
  providers: [EmbedProxyService, EmbedSessionGuard],
})
export class EmbedModule { }
