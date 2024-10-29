import { IsNotEmpty, IsUUID } from 'class-validator';

export class UnbindUserDto {
  @IsNotEmpty()
  @IsUUID('7')
  id: string;
}
