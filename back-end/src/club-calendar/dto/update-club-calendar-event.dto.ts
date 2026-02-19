import { PartialType } from '@nestjs/mapped-types';
import { CreateClubCalendarEventDto } from './create-club-calendar-event.dto';

export class UpdateClubCalendarEventDto extends PartialType(CreateClubCalendarEventDto) {}