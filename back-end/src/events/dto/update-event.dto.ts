import { User } from '../../users/entities/users.entity'

export class UpdateEventDto {
  date_event?: Date;
  duration?: {
    hours?: number;
    minutes?: number;
  };
  places?: number;
  name_event?: string;
  coach?: string;
  overview?: string;
  isVisible?: boolean;
  participants?: User[]; 
}