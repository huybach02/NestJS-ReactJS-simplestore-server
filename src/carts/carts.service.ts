import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from 'src/shared/schema/cart.schema';
import { Model } from 'mongoose';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from 'src/products/products.service';
import { ProductVariantsService } from 'src/product-variants/product-variants.service';
import { VouchersService } from 'src/vouchers/vouchers.service';
import { calculateTotal } from 'src/helpers/calculateSubtotal';
import { Voucher } from 'src/shared/schema/voucher';
import { Product } from 'src/shared/schema/product.schema';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Voucher.name) private voucherModel: Model<Voucher>,
    private readonly productsService: ProductsService,
    private readonly productVariantsService: ProductVariantsService,
    private readonly vouchersService: VouchersService,
  ) {}

  async createCart(createCartDto: CreateCartDto) {
    const cart = await this.cartModel.create(createCartDto);
    return cart;
  }

  async addToCart(addToCartDto: AddToCartDto) {
    const userCart = await this.findUserCart(addToCartDto.userId);
    await this.validateProduct(addToCartDto);
    await this.validateExistingProduct(userCart, addToCartDto);

    delete addToCartDto.userId;
    await this.cartModel.updateOne(
      { _id: userCart._id },
      {
        $push: {
          products: addToCartDto,
        },
      },
    );

    return {
      success: true,
      message: 'Product added to cart successfully!',
      data: userCart,
    };
  }

  async findUserCart(userId: string) {
    const userCart = await this.cartModel.findOne({ userId });
    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }
    return userCart;
  }

  private async validateProduct(addToCartDto: AddToCartDto) {
    const productData = await this.productsService.getProductById(
      addToCartDto.productId,
    );
    if (!productData) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (!productData.data.hasVariant) {
      if (productData.data.quantity < addToCartDto.buyQuantity) {
        throw new HttpException(
          'Quantity is not enough',
          HttpStatus.BAD_REQUEST,
        );
      }
      return;
    }

    const variantData = await this.productVariantsService.findOne(
      addToCartDto.variant.variantId,
    );
    if (!variantData) {
      throw new HttpException('Variant not found', HttpStatus.NOT_FOUND);
    }

    if (variantData.data.quantity < addToCartDto.buyQuantity) {
      throw new HttpException('Quantity is not enough', HttpStatus.BAD_REQUEST);
    }
  }

  private async validateExistingProduct(
    cart: Cart,
    addToCartDto: AddToCartDto,
  ) {
    const isProductExist = cart.products.some((product) => {
      if (!(product.productId as Product).hasVariant) {
        if (product.productId._id.toString() === addToCartDto.productId) {
          return true;
        }
      } else {
        if (
          product.productId._id.toString() === addToCartDto.productId &&
          product.variant.variantId._id.toString() ===
            addToCartDto.variant.variantId &&
          product.variant.size === addToCartDto.variant.size
        ) {
          return true;
        }
      }
    });
    if (isProductExist) {
      throw new HttpException('Already added to cart', HttpStatus.BAD_REQUEST);
    }
  }

  async getCart(userId: string) {
    const userCart = await this.cartModel.findOne({
      userId: userId,
    });

    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }

    const data = await this.getCartData(userCart);

    return {
      success: true,
      data,
    };
  }

  async getCartData(userCart: Cart) {
    const cartData = [];

    for (const product of userCart.products) {
      if (!product.hasVariant) {
        cartData.push({
          id: product.id,
          product: product.productId,
          hasVariant: false,
          buyQuantity: product.buyQuantity,
        });
      } else {
        cartData.push({
          id: product.id,
          product: product.productId,
          hasVariant: true,
          buyQuantity: product.buyQuantity,
          variant: product.variant.variantId,
          size: product.variant.size,
        });
      }
    }

    return cartData;
  }

  async removeFromCart(itemId: string, userId: string) {
    const userCart = await this.findUserCart(userId);

    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }

    const updatedCart = userCart.products.filter(
      (product) => product.id !== itemId,
    );
    await this.cartModel.updateOne(
      { _id: userCart._id },
      { $set: { products: updatedCart } },
    );

    return {
      success: true,
      message: 'Product removed from cart successfully!',
      data: updatedCart,
    };
  }

  async clearAllCart(userId: string) {
    const userCart = await this.findUserCart(userId);

    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }

    await this.cartModel.updateOne(
      { _id: userCart._id },
      { $set: { products: [] } },
    );

    return {
      success: true,
      message: 'Cart cleared successfully!',
    };
  }

  async updateCart(
    itemId: string,
    updateCartDto: { quantity: number },
    userId: string,
  ) {
    const userCart = await this.findUserCart(userId);

    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }

    await this.cartModel.updateOne(
      { products: { $elemMatch: { id: itemId } } },
      { $set: { 'products.$.buyQuantity': updateCartDto.quantity } },
    );

    return {
      success: true,
      message: 'Cart updated successfully!',
    };
  }

  async applyVoucher(
    voucher: string,
    selectedItems: string[],
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const LOCK_TIMEOUT = parseInt(process.env.LOCK_TIMEOUT) * 60 * 1000;

    const userCart = await this.findUserCart(userId);

    const totalPrice = await this.getTotalPrice(userCart, selectedItems);

    // Kiểm tra voucher
    const voucherData = await this.vouchersService.findOne(
      voucher,
      '-active -isDeleted -updatedAt -createdAt -usedCount',
    );
    if (!voucherData) {
      throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
    }

    // Kiểm tra có nằm trong thời gian khuyến mãi không
    await this.checkTimeVoucher(voucherData);

    // Kiểm tra số lần sử dụng voucher hiện tại của user này
    const userUsageCount = await this.getUserVoucherUsage(voucherData, userId);
    if (userUsageCount >= voucherData.numberOfUsesPerUser) {
      throw new HttpException(
        'You have reached maximum usage limit for this voucher',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Xóa các lock hết hạn
    await this.cleanExpiredLocks(voucher);

    // Kiểm tra tổng số lượng sử dụng (đã dùng + đang lock)
    const totalUsage = voucherData.usedCount + voucherData.pending?.length || 0;
    if (totalUsage >= voucherData.maxUser) {
      throw new HttpException(
        'Voucher has reached maximum usage',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalPrice < voucherData.minAmountOfOrder) {
      throw new HttpException(
        `Order total must be at least $${voucherData.minAmountOfOrder}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Tạo lock mới
    const userPending = voucherData.pending.some((pending) => {
      return (
        pending.userId.toString() === userId.toString() &&
        pending.expireAt > new Date()
      );
    });
    if (!userPending) {
      const lockExpiration = new Date(Date.now() + LOCK_TIMEOUT);
      await this.addPendingLock(voucher, {
        userId,
        expireAt: lockExpiration,
      });
    }

    // Tính toán số tiền giảm
    let discountAmount = 0;
    if (voucherData.typeDiscount === 'percentage') {
      discountAmount = Math.min(
        (totalPrice * voucherData.valueDiscount) / 100,
        voucherData.maxDiscount,
      );
    } else {
      discountAmount = Math.min(
        voucherData.valueDiscount,
        voucherData.maxDiscount,
      );
    }

    return {
      success: true,
      message: 'Voucher applied successfully!',
      data: {
        voucher: voucherData.toObject(),
        subTotal: totalPrice,
        discountAmount,
        finalTotal: totalPrice - discountAmount,
      },
    };
  }

  async getTotalPrice(userCart: Cart, selectedItems: string[]) {
    if (!userCart) {
      throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
    }

    const cartData = await this.getCartData(userCart);

    const selectedProducts = cartData.filter((product) =>
      selectedItems.includes(product.id),
    );

    const totalPrice = calculateTotal(selectedProducts);

    return totalPrice;
  }

  async checkTimeVoucher(voucherData: Voucher) {
    if (new Date(voucherData.startDate) > new Date()) {
      throw new HttpException(
        'Voucher not started yet',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (new Date(voucherData.endDate) < new Date()) {
      throw new HttpException('Voucher expired', HttpStatus.BAD_REQUEST);
    }
  }

  async getUserVoucherUsage(voucher: Voucher, userId: string) {
    return voucher.userUsage.filter((user) => user === userId).length;
  }

  async cleanExpiredLocks(voucherCode: string) {
    const now = new Date();
    await this.voucherModel.updateOne(
      { code: voucherCode },
      {
        $pull: {
          pending: {
            expireAt: { $lt: now },
          },
        },
      },
    );
  }

  async addPendingLock(
    voucherCode: string,
    lock: {
      userId: string;
      expireAt: Date;
    },
  ) {
    await this.voucherModel.updateOne(
      { code: voucherCode },
      {
        $push: {
          pending: lock,
        },
      },
    );
  }

  async confirmVoucherUsage(voucherCode: string, userId: string) {
    const session = await this.voucherModel.startSession();
    session.startTransaction();

    try {
      // Xóa lock và tăng số lượng sử dụng
      await this.voucherModel.updateOne(
        { code: voucherCode },
        {
          $pull: { pending: { userId } },
          $inc: {
            usedCount: 1,
            [`userUsage.${userId}`]: 1,
          },
        },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async removePendingLock(userId: string) {
    await this.voucherModel.updateOne(
      { userId },
      {
        $pull: {
          pending: { userId },
        },
      },
    );
  }
}
