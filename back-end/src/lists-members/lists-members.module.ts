import { Module, forwardRef } from '@nestjs/common';
import { ListsMembersService } from './lists-members.service';
import { ListsMembersController } from './lists-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsMember } from './lists-member.entity';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from 'src/events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListsMember]),
    forwardRef(() => UsersModule),
    forwardRef(() => EventsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXP') },
      }),
    }),
  ],
  controllers: [ListsMembersController],
  providers: [ListsMembersService],
  exports: [ListsMembersService],
})
export class ListsMembersModule { }
