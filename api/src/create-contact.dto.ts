import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
