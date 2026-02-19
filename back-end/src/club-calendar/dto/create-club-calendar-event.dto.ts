import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateClubCalendarEventDto {
  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(60)
  type: string;

  @IsString()
  @MaxLength(60)
  forWho: string;

  // YYYY-MM-DD
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate doit être au format YYYY-MM-DD' })
  startDate: string;

  // HH:MM ou HH:MM:SS
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'startTime doit être HH:MM (ou HH:MM:SS)' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate doit être au format YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, { message: 'endTime doit être HH:MM (ou HH:MM:SS)' })
  endTime?: string;

  @IsString()
  @MaxLength(200)
  location: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}