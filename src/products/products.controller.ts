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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/decorators/role.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(['admin'])
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @SetMetadata('isPublic', true)
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query') query: string,
  ) {
    return this.productsService.findAll(+page, +limit, query);
  }

  @SetMetadata('isPublic', true)
  @Get('best-selling')
  bestSelling(@Query('limit') limit: string) {
    return this.productsService.bestSelling(+limit);
  }

  @SetMetadata('isPublic', true)
  @Get('related/:categoryId')
  getRelatedProduct(@Param('categoryId') categoryId: string) {
    return this.productsService.getRelatedProduct(categoryId);
  }

  @SetMetadata('isPublic', true)
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Get(':id/variants')
  findVariantOfProduct(@Param('id') id: string) {
    return this.productsService.findVariantOfProduct(id);
  }

  @Roles(['admin'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Roles(['admin'])
  @Post('download')
  download(@Body() exportFields: any) {
    return this.productsService.download(exportFields);
  }

  @Roles(['admin'])
  @Post('action-when-selected')
  actionWhenSelected(@Body() data: any) {
    return this.productsService.actionWhenSelected(data);
  }
}
