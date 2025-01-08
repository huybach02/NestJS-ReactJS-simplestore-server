import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from 'src/carts/carts.module';
import { VouchersModule } from 'src/vouchers/vouchers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CartTemp, CartTempSchema } from 'src/shared/schema/cartTemp.shema';
import { Address, AddressSchema } from 'src/shared/schema/address.schema';
import { Order, OrderSchema } from 'src/shared/schema/order.schema';
import { User, UserSchema } from 'src/shared/schema/user.schema';

@Module({
  imports: [
    CartsModule,
    VouchersModule,
    MongooseModule.forFeature([
      { name: CartTemp.name, schema: CartTempSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
