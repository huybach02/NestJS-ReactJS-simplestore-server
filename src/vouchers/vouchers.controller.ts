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
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Roles } from 'src/decorators/role.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Roles(['admin'])
  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query') query: any,
  ) {
    return this.vouchersService.findAll(+page, +limit, query);
  }

  @Get('active')
  findAllWithActive() {
    return this.vouchersService.findAllWithActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Roles(['admin'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  @Roles(['admin'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }

  @Roles(['admin'])
  @Post('download')
  download(@Body() exportFields: any) {
    return this.vouchersService.download(exportFields);
  }

  @Roles(['admin'])
  @Post('action-when-selected')
  actionWhenSelected(@Body() data: any) {
    return this.vouchersService.actionWhenSelected(data);
  }
}
