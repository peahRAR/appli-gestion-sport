// update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() // Indique que le champ est facultatif
  password?: string; // Définit que le champ password peut être null ou undefined
  currentPassword: any;
  user: object;
}
