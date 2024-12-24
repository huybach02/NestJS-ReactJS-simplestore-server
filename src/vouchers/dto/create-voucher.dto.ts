import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  startDate: string | null | Date;

  @IsNotEmpty()
  @IsString()
  endDate: string | null | Date;

  @IsNotEmpty()
  @IsString()
  typeDiscount: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  valueDiscount: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  minAmountOfOrder: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  maxDiscount: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  maxUser: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  numberOfUsesPerUser: number;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
