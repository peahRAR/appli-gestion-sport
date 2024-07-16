import { User } from '../../users/entities/users.entity'

export class UpdateEventDto {
  date_event?: Date;
  duration?: string;
  places?: number;
  name_event?: string;
  coach?: string;
  overview?: string;
  participants?: User[]; // Utilisez le type d'entité User au lieu de number[]
}