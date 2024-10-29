import { IsEmail, IsNotEmpty } from 'class-validator';

export class BindUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
