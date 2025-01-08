import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/shared/schema/product.schema';
import { Model } from 'mongoose';
import { ProductVariant } from 'src/shared/schema/productVariant.schema';
import { handleFilter } from 'src/helpers/handleFilter';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductVariant.name)
    private productVariantModel: Model<ProductVariant>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      if (!createProductDto.hasVariant) {
        if (createProductDto.hasSale) {
          if (createProductDto.typeSale === 'percentage') {
            createProductDto.salePrice =
              createProductDto.originalPrice -
              (createProductDto.originalPrice * createProductDto.saleValue) /
                100;
          }
          if (createProductDto.typeSale === 'fixed') {
            createProductDto.salePrice =
              createProductDto.originalPrice - createProductDto.saleValue;
          }
        }
      }

      const startDate = new Date(createProductDto.saleStartDate);
      const endDate = new Date(createProductDto.saleEndDate);

      if (startDate > endDate) {
        throw new HttpException(
          'Start date cannot be greater than End date',
          HttpStatus.BAD_REQUEST,
        );
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

  async findAll(page: number, limit: number, filter: any) {
    try {
      const skip = (page - 1) * limit;

      const { baseQuery, sort } = handleFilter(filter);

      const total = await this.productModel.countDocuments(baseQuery);

      const products = await this.productModel
        .find(baseQuery)
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('supplier', 'name id slug')
        .populate('category', 'name id slug');

      const productsWithVariant = await Promise.all(
        products.map(async (product, index) => {
          const variants = await this.productVariantModel.find({
            productId: product._id.toString(),
          });

          return {
            ...product.toObject(),
            index: skip + index + 1,
            variants: variants,
          };
        }),
      );

      return {
        success: true,
        data: productsWithVariant,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async bestSelling(limit: number) {
    const products = await this.productModel
      .find({ active: true, isDeleted: false })
      .sort({ soldQuantity: -1 })
      .limit(limit || 12)
      .populate('supplier', 'name id slug')
      .populate('category', 'name id slug');

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await this.productVariantModel.find({
          productId: product._id.toString(),
          active: true,
          isDeleted: false,
        });

        return {
          ...product.toObject(),
          variants: variants,
        };
      }),
    );

    return {
      success: true,
      data: productsWithVariants,
    };
  }

  async findOne(slug: string) {
    try {
      const product = await this.productModel
        .findOne({ slug, active: true, isDeleted: false })
        .populate('supplier', 'name id slug')
        .populate('category', 'name id slug');

      const variants = await this.productVariantModel.find({
        productId: product._id.toString(),
        active: true,
        isDeleted: false,
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          ...product.toObject(),
          variants: variants,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductById(id: string, select?: string) {
    try {
      const product = await this.productModel
        .findOne({ _id: id, active: true, isDeleted: false })
        .populate('supplier', 'name id slug')
        .populate('category', 'name id slug')
        .select(select);

      if (!product) {
        return {
          success: false,
          data: null,
        };
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getRelatedProduct(categoryId: string) {
    const products = await this.productModel
      .find({ category: categoryId, active: true, isDeleted: false })
      .limit(6)
      .sort({ createdAt: -1 })
      .populate('supplier', 'name id slug')
      .populate('category', 'name id slug');

    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await this.productVariantModel.find({
          productId: product._id.toString(),
          active: true,
          isDeleted: false,
        });

        return {
          ...product.toObject(),
          variants: variants,
        };
      }),
    );

    return {
      success: true,
      data: productsWithVariants,
    };
  }

  async findVariantOfProduct(id: string) {
    const variants = await this.productVariantModel.find({
      productId: id,
    });

    return {
      success: true,
      data: variants,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel.findById(id);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      if (updateProductDto.hasVariant) {
        updateProductDto.originalPrice = null;
        updateProductDto.hasSale = null;
        updateProductDto.typeSale = null;
        updateProductDto.saleValue = null;
        updateProductDto.salePrice = null;
        updateProductDto.saleStartDate = null;
        updateProductDto.saleEndDate = null;
        updateProductDto.quantity = null;
      }

      if (!updateProductDto.hasVariant) {
        if (updateProductDto.hasSale) {
          if (updateProductDto.typeSale === 'percentage') {
            updateProductDto.salePrice =
              updateProductDto.originalPrice -
              (updateProductDto.originalPrice * updateProductDto.saleValue) /
                100;
          }
          if (updateProductDto.typeSale === 'fixed') {
            updateProductDto.salePrice =
              updateProductDto.originalPrice - updateProductDto.saleValue;
          }
        }
      }

      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        {
          ...updateProductDto,
          quantity:
            !product.hasVariant && updateProductDto.hasVariant
              ? 0
              : product.quantity,
        },
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

      await this.productModel.findByIdAndUpdate(id, {
        isDeleted: true,
      });

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

  async actionWhenSelected(data: any) {
    const { action, ids } = data;

    switch (action) {
      case 'active-all':
        await this.productModel.updateMany(
          { _id: { $in: ids } },
          { active: true },
        );
        break;
      case 'inactivate-all':
        await this.productModel.updateMany(
          { _id: { $in: ids } },
          { active: false },
        );
        break;
      case 'delete-all':
        await this.productModel.updateMany(
          { _id: { $in: ids } },
          { isDeleted: true },
        );
        break;
    }

    return {
      success: true,
      message: 'Action performed successfully!',
    };
  }
}
