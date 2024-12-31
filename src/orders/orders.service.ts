import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartsService } from 'src/carts/carts.service';
import { VouchersService } from 'src/vouchers/vouchers.service';
import { InjectModel } from '@nestjs/mongoose';
import { CartTemp } from 'src/shared/schema/cartTemp.shema';
import { Model } from 'mongoose';
import { deleteFieldFormObject } from 'src/helpers/deleteFieldFormObject';
import { Address } from 'src/shared/schema/address.schema';
import { AddressDto } from './dto/address.dto';
import { JwtService } from '@nestjs/jwt';
import { Order } from 'src/shared/schema/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cartsService: CartsService,
    private readonly vouchersService: VouchersService,
    private readonly jwtService: JwtService,
    @InjectModel(CartTemp.name) private cartTempModel: Model<CartTemp>,
    @InjectModel(Address.name) private addressModel: Model<Address>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const cartTemp = await this.cartTempModel.findOne({ userId });

      const { token, paymentMethod, paymentStatus } = createOrderDto;

      const decodedToken = this.jwtService.verify(token);

      console.log(decodedToken.sub, userId);

      if (!decodedToken || decodedToken.sub.toString() !== userId.toString()) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      if (!cartTemp) {
        throw new HttpException(
          'Your purchase has expired! Please place a new order.',
          HttpStatus.NOT_FOUND,
        );
      }

      const order = await this.orderModel.create({
        userId,
        products: cartTemp.products,
        voucher: cartTemp.voucher,
        discount: cartTemp.discount,
        subTotal: cartTemp.subTotal,
        totalAmount: cartTemp.totalAmount,
        address: cartTemp.address,
        paymentMethod,
        paymentStatus,
      });

      await this.cartTempModel.deleteOne({ userId });

      for (const product of order.products) {
        await this.cartsService.removeFromCart(product.id, userId);
      }

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      throw new HttpException(
        'Something went wrong! Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async placeOrder(placeOrderData: any, userId: string) {
    const userCart = await this.cartsService.findUserCart(userId);
    const dataProduct = await this.cartsService.getCartData(userCart);

    const products = [];

    for (const item of placeOrderData.selectedItems) {
      for (const cartItem of dataProduct) {
        if (cartItem.id === item) {
          const productToSave = {
            id: cartItem.id,
            product: JSON.parse(JSON.stringify(cartItem.product)),
            hasVariant: cartItem.hasVariant,
            buyQuantity: cartItem.buyQuantity,
            variant: cartItem.variant
              ? JSON.parse(JSON.stringify(cartItem.variant))
              : null,
            size: cartItem.size || '',
          };
          products.push(productToSave);
        }
      }
    }

    const subTotal = await this.cartsService.getTotalPrice(
      userCart,
      placeOrderData.selectedItems,
    );

    let voucher = null;
    let discount = 0;
    if (placeOrderData.voucher) {
      const { voucherData, discountAmount } = await this.handleVoucher(
        placeOrderData,
        userId,
        subTotal,
      );
      voucher = voucherData ? { ...voucherData } : null;
      discount = discountAmount || 0;
    }

    const cartTemp = await this.cartTempModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          products,
          voucher,
          discount,
          subTotal,
          totalAmount: subTotal - discount,
        },
      },
      { new: true, upsert: true },
    );

    return {
      success: true,
      data: cartTemp,
    };
  }

  private async handleVoucher(
    placeOrderData: any,
    userId: any,
    subTotal: number,
  ) {
    let voucherData = null;
    let discountAmount = 0;

    voucherData = await this.vouchersService.findOneById(
      placeOrderData.voucher,
      '-active -isDeleted -updatedAt -createdAt -usedCount',
    );
    if (!voucherData) {
      throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
    }

    await this.validateVoucher(voucherData, userId);

    if (voucherData.typeDiscount === 'percentage') {
      discountAmount = Math.min(
        (subTotal * voucherData.valueDiscount) / 100,
        voucherData.maxDiscount,
      );
    } else {
      discountAmount = Math.min(
        voucherData.valueDiscount,
        voucherData.maxDiscount,
      );
    }

    voucherData = deleteFieldFormObject(voucherData.toObject(), [
      '_id',
      'usedCount',
      'isDeleted',
      'userUsage',
      'active',
      'createdAt',
      'updatedAt',
    ]);

    return { voucherData, discountAmount };
  }

  async getCartTemp(userId: string) {
    try {
      const cartTemp = await this.cartTempModel.findOne({ userId });
      if (!cartTemp) {
        throw new HttpException(
          'Your purchase has expired! Please place a new order.',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: cartTemp,
      };
    } catch (error) {
      throw new HttpException(
        'Your purchase has expired! Please place a new order.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async validateVoucher(voucherData: any, userId: string) {
    await this.cartsService.checkTimeVoucher(voucherData);

    const userPending = voucherData.pending.some((pending: any) => {
      return (
        pending.userId.toString() === userId.toString() &&
        pending.expireAt > new Date()
      );
    });
    if (!userPending) {
      await this.cartTempModel.deleteOne({ userId });

      throw new HttpException(
        'Your purchase has expired! Please place a new order.',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getAddress(userId: string) {
    const address = await this.addressModel.find({ userId });
    return {
      success: true,
      data: address,
    };
  }

  async addAddress(addAddressDto: AddressDto, userId: string) {
    const address = await this.addressModel.create({
      ...addAddressDto,
      userId,
    });
    return {
      success: true,
      message: 'Address added successfully',
      data: address,
    };
  }

  async deleteAddress(id: string) {
    await this.addressModel.findByIdAndDelete(id);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }

  async checkVoucher(userId: string) {
    const cartTemp = await this.cartTempModel.findOne({ userId });

    if (!cartTemp) {
      throw new HttpException('Cart temp not found', HttpStatus.NOT_FOUND);
    }

    if (cartTemp.voucher) {
      await this.validateVoucher(cartTemp.voucher, userId);
    }

    return {
      success: true,
    };
  }

  async selectAddress(selectAddressDto: AddressDto, userId: string) {
    try {
      await this.cartTempModel.findOneAndUpdate(
        { userId },
        { $set: { address: selectAddressDto } },
      );
      return {
        success: true,
        message: 'Address selected successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Address selected failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPaymentToken(userId: string) {
    const payload = { sub: userId };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '10m',
    });

    return {
      success: true,
      data: token,
    };
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
