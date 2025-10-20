import { User } from '../../users/entities/users.entity'

export class CreateEventDto {
  date_event: Date;
  duration: string;
  places: number;
  name_event: string;
  coach: string;
  overview?: string;
  participants?: User[];
  isVisible?: boolean; 
}