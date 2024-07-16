import { IsEmail, IsNotEmpty, IsString, MinLength, IsDate } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsDate()
  @IsNotEmpty()
  birthday: Date;

  @IsString()
  tel_num?: string;

  @IsString()
  tel_medic?: string;

  @IsString()
  tel_emergency?: string;

  @IsString()
  weight?: string;

  @IsString()
  license?: string;

  @IsString()
  date_subscribe?: Date;

  @IsString()
  date_payment?: string;

  @IsString()
  date_end_pay?: string;

  @IsString()
  avatar?: string;

  @IsString()
  @MinLength(8)
  password: string;

  role: number;
}
