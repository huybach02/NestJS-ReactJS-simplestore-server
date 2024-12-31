import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
