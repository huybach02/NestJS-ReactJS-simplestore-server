import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  parentId: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
