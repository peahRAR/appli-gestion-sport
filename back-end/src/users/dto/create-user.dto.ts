// create-user.dto.ts
import { IsString, IsBoolean, IsDate, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsDate()
  birthday: Date;

  @IsNotEmpty()
  @IsBoolean()
  gender: boolean;

  @IsOptional()
  @IsString()
  tel_medic: string;

  @IsOptional()
  @IsString()
  tel_emergency: string;

  @IsNotEmpty()
  weight: number;

  @IsOptional()
  @IsString()
  licence: string;

  @IsOptional()
  @IsDate()
  date_subscribe: Date;

  @IsOptional()
  @IsDate()
  date_payment: Date;

  @IsOptional()
  @IsDate()
  date_end_pay: Date;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  role: number;
}
