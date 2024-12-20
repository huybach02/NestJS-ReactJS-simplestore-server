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

export class CreateProductVariantDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  sizes: string[];

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
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

  @ValidateIf((o) => o.hasVariant === false)
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  quantity: number;

  @IsOptional()
  @IsString()
  thumbnail: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
