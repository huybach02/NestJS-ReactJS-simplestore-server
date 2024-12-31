import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from 'src/shared/schema/cart.schema';
import { ProductsModule } from 'src/products/products.module';
import { ProductVariantsModule } from 'src/product-variants/product-variants.module';
import { VouchersModule } from 'src/vouchers/vouchers.module';
import { Voucher, VoucherSchema } from 'src/shared/schema/voucher';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Voucher.name, schema: VoucherSchema },
    ]),
    ProductsModule,
    ProductVariantsModule,
    VouchersModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
