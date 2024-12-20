import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from 'src/decorators/role.decorator';

@Roles(['admin'])
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('fake-data')
  fake() {
    return this.suppliersService.fake();
  }

  @Delete('clear-all')
  clearAll() {
    return this.suppliersService.clearAll();
  }

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query') query: any,
  ) {
    return this.suppliersService.findAll(+page, +limit, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Post('download')
  download(@Body() exportFields: any) {
    return this.suppliersService.download(exportFields);
  }

  @Roles(['admin'])
  @Post('action-when-selected')
  actionWhenSelected(@Body() data: any) {
    return this.suppliersService.actionWhenSelected(data);
  }
}
