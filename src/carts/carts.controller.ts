import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.createCart(createCartDto);
  }

  @Post('add-to-cart')
  addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(addToCartDto);
  }

  @Get()
  async getCart(@Req() req: Request) {
    return this.cartsService.getCart(req['user']._id);
  }

  @Delete('clear-all')
  async clearAllCart(@Req() req: Request) {
    return this.cartsService.clearAllCart(req['user']._id);
  }

  @Delete(':itemId')
  async removeFromCart(@Param('itemId') itemId: string, @Req() req: Request) {
    return this.cartsService.removeFromCart(itemId, req['user']._id);
  }

  @Put(':itemId')
  async updateCart(
    @Param('itemId') itemId: string,
    @Body() updateCartDto: { quantity: number },
    @Req() req: Request,
  ) {
    return this.cartsService.updateCart(itemId, updateCartDto, req['user']._id);
  }

  @Post('apply-voucher')
  async applyVoucher(
    @Body() applyVoucherDto: { voucher: string; selectedItems: string[] },
    @Req() req: Request,
  ) {
    return this.cartsService.applyVoucher(
      applyVoucherDto.voucher,
      applyVoucherDto.selectedItems,
      req['user']._id,
    );
  }
}
