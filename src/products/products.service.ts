import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/shared/schema/product.schema';
import { Model } from 'mongoose';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      if (createProductDto.hasSale) {
        if (createProductDto.typeSale === 'percentage') {
          createProductDto.salePrice =
            createProductDto.originalPrice -
            (createProductDto.originalPrice * createProductDto.saleValue) / 100;
        }
        if (createProductDto.typeSale === 'fixed') {
          createProductDto.salePrice =
            createProductDto.originalPrice - createProductDto.saleValue;
        }
      }

      const newProduct = await this.productModel.create(createProductDto);

      return {
        success: true,
        message: 'Product created successfully!',
        data: newProduct,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const total = await this.productModel.countDocuments();

      const products = await this.productModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('supplier', 'name id')
        .populate('category', 'name id');

      const productsWithNumber = products.map((product, index) => ({
        ...product.toObject(),
        index: skip + index + 1,
      }));

      return {
        success: true,
        data: productsWithNumber,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel.findById(id);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (updateProductDto.hasSale) {
        if (updateProductDto.typeSale === 'percentage') {
          updateProductDto.salePrice =
            updateProductDto.originalPrice -
            (updateProductDto.originalPrice * updateProductDto.saleValue) / 100;
        }
        if (updateProductDto.typeSale === 'fixed') {
          updateProductDto.salePrice =
            updateProductDto.originalPrice - updateProductDto.saleValue;
        }
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        {
          new: true,
        },
      );

      return {
        success: true,
        message: 'Product updated successfully!',
        data: updatedProduct,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productModel.findById(id);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      await this.productModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Product deleted successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(exportFields: any) {
    const { fields, date, isAllDate } = exportFields;

    let products = [];
    if (isAllDate) {
      products = await this.productModel
        .find()
        .select([...fields, 'createdAt', 'updatedAt'])
        .populate('supplier', 'name id')
        .populate('category', 'name id');
    } else {
      products = await this.productModel
        .find({
          createdAt: { $gte: date[0], $lte: date[1] },
        })
        .select([...fields, 'createdAt', 'updatedAt'])
        .populate('supplier', 'name id')
        .populate('category', 'name id');
    }

    const data = products.map((product, index) => {
      const { _id, id, ...rest } = product.toObject();
      if (fields.includes('supplier')) {
        rest.supplier = product.supplier.name;
      }
      if (fields.includes('category')) {
        rest.category = product.category.name;
      }

      return {
        index: index + 1,
        ...rest,
      };
    });

    const total = await this.productModel.countDocuments();

    return {
      success: true,
      data,
      total,
    };
  }
}
