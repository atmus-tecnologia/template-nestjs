import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { Exists } from '~/common/validators';
import { User } from '~/modules/users/entities';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 255)
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

  @IsNotEmpty()
  @IsBoolean()
  acceptedTerms: boolean;
}
