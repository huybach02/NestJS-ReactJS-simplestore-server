import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  supplier: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  originalPrice: number;

  @IsNotEmpty()
  @IsBoolean()
  hasSale: boolean;

  @IsOptional()
  @IsString()
  typeSale: string | null;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  saleValue: number | null;

  @IsOptional()
  @IsNumber()
  salePrice: number | null;

  @IsOptional()
  @IsString()
  saleStartDate: string | null | Date;

  @IsOptional()
  @IsString()
  saleEndDate: string | null | Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  quantity: number | null;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsNumber()
  takingReturn: number;

  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsArray()
  photoUrls: string[] | null;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
