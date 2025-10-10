import { IsEmail, IsOptional, IsString, MinLength, IsDate, IsBoolean } from 'class-validator';

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

  @IsDate()
  @IsOptional()
  birthday?: Date;

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
}
