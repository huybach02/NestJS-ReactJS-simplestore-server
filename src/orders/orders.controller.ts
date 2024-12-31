import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddressDto } from './dto/address.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return this.ordersService.create(createOrderDto, req['user']._id);
  }

  @Post('place-order')
  placeOrder(@Body() placeOrderData: any, @Req() req: Request) {
    return this.ordersService.placeOrder(placeOrderData, req['user']._id);
  }

  @Get('cart-temp')
  getCartTemp(@Req() req: Request) {
    return this.ordersService.getCartTemp(req['user']._id);
  }

  @Get('address')
  getAddress(@Req() req: Request) {
    return this.ordersService.getAddress(req['user']._id);
  }

  @Post('address')
  addAddress(@Body() addAddressDto: AddressDto, @Req() req: Request) {
    return this.ordersService.addAddress(addAddressDto, req['user']._id);
  }

  @Delete('address/:id')
  deleteAddress(@Param('id') id: string) {
    return this.ordersService.deleteAddress(id);
  }

  @Get('check-voucher')
  checkVoucher(@Req() req: Request) {
    return this.ordersService.checkVoucher(req['user']._id);
  }

  @Post('select-address')
  selectAddress(@Body() selectAddressDto: AddressDto, @Req() req: Request) {
    return this.ordersService.selectAddress(selectAddressDto, req['user']._id);
  }

  @Get('create-payment-token')
  createPaymentToken(@Req() req: Request) {
    return this.ordersService.createPaymentToken(req['user']._id);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
