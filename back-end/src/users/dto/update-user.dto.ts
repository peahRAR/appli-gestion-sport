import { IsEmail, IsOptional, IsString, MinLength, IsDate, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { GRADE_VALUES, FORMATION_VALUES, Grade, Formation } from '../constants/fmmaf';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  firstname?: string;

  @IsDateString() 
  @IsOptional() 
  birthday?: string;

  @IsString()
  @IsOptional()
  tel_num?: string;

  @IsString()
  @IsOptional()
  tel_medic?: string;

  @IsString()
  @IsOptional()
  tel_emergency?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  license?: string;

  @IsString()
  @IsOptional()
  date_subscribe?: string;

  @IsString()
  @IsOptional()
  date_payment?: string;

  @IsString()
  @IsOptional()
  date_end_pay?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsBoolean()
  @IsOptional()
  approove_rules?: boolean;

  // Réservés aux administrateurs (vérifié dans UsersController.update()) et
  // pertinents uniquement pour un licencié FMMAF.
  @IsIn(GRADE_VALUES)
  @IsOptional()
  grade?: Grade;

  @IsIn(FORMATION_VALUES)
  @IsOptional()
  formation?: Formation;
}
