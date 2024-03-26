import { Module } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { ListsMembersController } from './lists-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsMember } from './lists-member.entity';import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from 'src/events/events.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ListsMember]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXP') },
      }),
    }),
    EventsModule
  ],
  controllers: [ListsMembersController],
  providers: [ListsMembersService],
  exports: [ListsMembersService],
})
export class ListsMembersModule {}
