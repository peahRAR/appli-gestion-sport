export class CreateEventDto {
    date_event: Date;
    duration: string;
    places: number;
    name_event: string;
    coach: string;
    overview?: string;
    participants?: number[]; // Vous pouvez inclure les IDs des participants si nécessaire
  }
  