import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @SetMetadata('isPublic', true)
  @Get()
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.categoriesService.findAll(+page, +limit);
  }

  @SetMetadata('isPublic', true)
  @Get('by-super-category/:superCategoryId')
  findAllBySuperCategory(@Param('superCategoryId') superCategoryId: string) {
    return this.categoriesService.findAllBySuperCategory(superCategoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Post('download')
  download(@Body() exportFields: any) {
    return this.categoriesService.download(exportFields);
  }
}
