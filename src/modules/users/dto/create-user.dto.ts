import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { Exists } from '~/common/validators';
import { User } from '../entities';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Exists(User, 'email')
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
