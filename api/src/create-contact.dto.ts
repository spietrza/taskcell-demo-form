import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
