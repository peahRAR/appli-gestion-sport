import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events.entity';
import { ListsMembersModule } from 'src/lists-members/lists-members.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => ListsMembersModule),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
