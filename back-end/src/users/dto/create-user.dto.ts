// create-user.dto.ts
import {
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsEmail({}, { message: "L'adresse email doit être un email valide" })
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
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

  @IsOptional()
  weight: number;

  @IsOptional()
  @IsString()
  licence: string;

  @IsOptional()
  @IsDateString()
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = false;
}
