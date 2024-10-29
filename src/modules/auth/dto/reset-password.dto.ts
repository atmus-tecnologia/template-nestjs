import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '~/common/validators';

export class ResetPassowordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}
