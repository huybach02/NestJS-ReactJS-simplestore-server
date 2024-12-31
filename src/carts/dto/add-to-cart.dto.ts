import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  buyQuantity: number;

  @IsNotEmpty()
  @IsBoolean()
  hasVariant: boolean;

  @IsOptional()
  @IsObject()
  variant: {
    variantId: string;
    size: string | null;
  };
}
