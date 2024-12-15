import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/shared/schema/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const checkCategory = await this.categoryModel.findOne({
        slug: createCategoryDto.slug,
        parentId: createCategoryDto.parentId,
      });

      if (checkCategory) {
        throw new HttpException(
          'Category already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newCategory = await this.categoryModel.create(createCategoryDto);

      return {
        success: true,
        message: 'Category created successfully!',
        data: newCategory,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const total = await this.categoryModel.countDocuments();

      const categories = await this.categoryModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const categoriesWithNumber = categories.map((category, index) => ({
        ...category.toObject(),
        index: skip + index + 1,
      }));

      return {
        success: true,
        data: categoriesWithNumber,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllBySuperCategory(superCategoryId: string) {
    try {
      const categories = await this.categoryModel.find({
        superCategory: superCategoryId,
      });

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        {
          new: true,
        },
      );

      return {
        success: true,
        message: 'Category updated successfully!',
        data: updatedCategory,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryModel.findById(id);

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      await this.categoryModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Category deleted successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(exportFields: any) {
    const { fields, date, isAllDate } = exportFields;

    let categories = [];
    if (isAllDate) {
      categories = await this.categoryModel
        .find()
        .select([...fields, 'createdAt', 'updatedAt']);
    } else {
      categories = await this.categoryModel
        .find({
          createdAt: { $gte: date[0], $lte: date[1] },
        })
        .select(fields);
    }

    const data = categories.map((category, index) => {
      const { _id, id, ...rest } = category.toObject();
      return {
        index: index + 1,
        ...rest,
      };
    });

    const total = await this.categoryModel.countDocuments();

    return {
      success: true,
      data,
      total,
    };
  }
}
