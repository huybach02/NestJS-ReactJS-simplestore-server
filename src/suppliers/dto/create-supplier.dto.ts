import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  product: string;

  @IsOptional()
  @IsArray()
  categories: string[];

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price: number;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  takingReturn: string;

  @IsOptional()
  @IsString()
  photoUrl: string | null;

  @IsNotEmpty()
  @IsString()
  active: string;
}
