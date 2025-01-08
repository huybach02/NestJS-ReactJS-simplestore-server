import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from '../shared/schema/wishlist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant } from 'src/shared/schema/productVariant.schema';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariant>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: string) {
    const checkWishlist = await this.wishlistModel.findOne({
      userId,
      productId: createWishlistDto.productId,
    });

    if (checkWishlist) {
      throw new HttpException(
        'Product already in wishlist',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const wishlist = await this.wishlistModel.create({
        ...createWishlistDto,
        userId,
      });

      return {
        success: true,
        message: 'Product added to wishlist',
        data: wishlist,
      };
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userId: string) {
    const wishlists = await this.wishlistModel
      .find({ userId })
      .populate('productId');

    if (!wishlists) {
      throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
    }

    const productsWithVariant = await Promise.all(
      wishlists.map(async (wishlist: any, index) => {
        const variants = await this.productVariantModel.find({
          productId: wishlist.productId._id.toString(),
        });

        return {
          ...wishlist.toObject(),
          productId: {
            ...wishlist.productId.toObject(),
            variants: variants,
          },
        };
      }),
    );

    return {
      success: true,
      data: productsWithVariant,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} wishlist`;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return `This action updates a #${id} wishlist`;
  }

  async remove(id: string, userId: string) {
    try {
      const wishlist = await this.wishlistModel.findOneAndDelete({
        productId: id,
        userId,
      });

      if (!wishlist) {
        throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Wishlist removed successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
