import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariant } from 'src/shared/schema/productVariant.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/shared/schema/product.schema';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariant>,
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    try {
      if (createProductVariantDto.hasSale) {
        if (createProductVariantDto.typeSale === 'percentage') {
          createProductVariantDto.salePrice =
            createProductVariantDto.originalPrice -
            (createProductVariantDto.originalPrice *
              createProductVariantDto.saleValue) /
              100;
        }
        if (createProductVariantDto.typeSale === 'fixed') {
          createProductVariantDto.salePrice =
            createProductVariantDto.originalPrice -
            createProductVariantDto.saleValue;
        }
      }

      const newProductVariant = await this.productVariantModel.create(
        createProductVariantDto,
      );

      const product = await this.productModel.findById(
        createProductVariantDto.productId,
      );

      await this.productModel.findByIdAndUpdate(
        createProductVariantDto.productId,
        {
          $set: {
            quantity: product.quantity + createProductVariantDto.quantity,
          },
        },
      );

      return {
        success: true,
        message: 'Product variant created successfully!',
        data: newProductVariant,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(productId: string) {
    try {
      const variants = await this.productVariantModel
        .find({ productId: productId, isDeleted: false })
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: variants,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} productVariant`;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    try {
      const productVariant = await this.productVariantModel.findById(id);
      const product = await this.productModel.findById(
        productVariant.productId,
      );

      const quantity = product.quantity - productVariant.quantity;

      if (!productVariant) {
        throw new HttpException(
          'Product variant not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (updateProductVariantDto.hasSale) {
        if (updateProductVariantDto.typeSale === 'percentage') {
          updateProductVariantDto.salePrice =
            updateProductVariantDto.originalPrice -
            (updateProductVariantDto.originalPrice *
              updateProductVariantDto.saleValue) /
              100;
        }
        if (updateProductVariantDto.typeSale === 'fixed') {
          updateProductVariantDto.salePrice =
            updateProductVariantDto.originalPrice -
            updateProductVariantDto.saleValue;
        }
      }

      const updatedProduct = await this.productVariantModel.findByIdAndUpdate(
        id,
        updateProductVariantDto,
        {
          new: true,
        },
      );

      await this.productModel.findByIdAndUpdate(productVariant.productId, {
        $set: {
          quantity: quantity + updateProductVariantDto.quantity,
        },
      });

      return {
        success: true,
        message: 'Product variant updated successfully!',
        data: updatedProduct,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const productVariant = await this.productVariantModel.findById(id);
      const product = await this.productModel.findById(
        productVariant.productId,
      );

      const quantity = product.quantity - productVariant.quantity;

      if (!productVariant) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      await this.productVariantModel.findByIdAndUpdate(id, {
        isDeleted: true,
      });

      await this.productModel.findByIdAndUpdate(productVariant.productId, {
        $set: {
          quantity: quantity,
        },
      });

      return {
        success: true,
        message: 'Product variant deleted successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
