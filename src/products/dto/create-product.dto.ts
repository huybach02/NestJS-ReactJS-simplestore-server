import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
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
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  importPrice: number;

  @ValidateIf((o) => o.hasVariant === false)
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  originalPrice: number;

  @IsOptional()
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
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  salePrice: number | null;

  @IsOptional()
  @IsString()
  saleStartDate: string | null | Date;

  @IsOptional()
  @IsString()
  saleEndDate: string | null | Date;

  @IsNotEmpty()
  @IsBoolean()
  hasVariant: boolean;

  @ValidateIf((o) => o.hasVariant === false)
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  quantity: number;

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

  @IsOptional()
  @IsString()
  shortDescription: string | null;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  images: string[] | null;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
