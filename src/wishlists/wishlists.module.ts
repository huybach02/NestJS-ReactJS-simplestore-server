import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, WishlistSchema } from 'src/shared/schema/wishlist.schema';
import {
  ProductVariant,
  ProductVariantSchema,
} from 'src/shared/schema/productVariant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: ProductVariant.name, schema: ProductVariantSchema },
    ]),
  ],
  controllers: [WishlistsController],
  providers: [WishlistsService],
})
export class WishlistsModule {}
