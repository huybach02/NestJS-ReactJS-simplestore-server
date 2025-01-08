import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/shared/schema/order.schema';
import { Category, CategorySchema } from 'src/shared/schema/category.schema';
import { Product, ProductSchema } from 'src/shared/schema/product.schema';
import { Supplier, SupplierSchema } from 'src/shared/schema/supplier.schema';
import { User, UserSchema } from 'src/shared/schema/user.schema';
import { Voucher, VoucherSchema } from 'src/shared/schema/voucher';
import { Review, ReviewSchema } from 'src/shared/schema/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: User.name, schema: UserSchema },
      { name: Voucher.name, schema: VoucherSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
