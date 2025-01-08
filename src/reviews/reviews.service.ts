import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from 'src/shared/schema/review.schema';
import { Model } from 'mongoose';
import { handleFilter } from 'src/helpers/handleFilter';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    try {
      const review = await this.reviewModel.create({
        ...createReviewDto,
        userId,
      });
      return {
        success: true,
        message: 'Review created successfully',
        data: review,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllByProductId(productId: string) {
    try {
      const reviews = await this.reviewModel
        .find({ productId, active: true })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 });
      return {
        success: true,
        data: reviews,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page: number, limit: number, query: any) {
    try {
      const skip = (page - 1) * limit;

      const { baseQuery, sort } = handleFilter(query);

      const total = await this.reviewModel.countDocuments(baseQuery);

      delete baseQuery.isDeleted;

      const reviews = await this.reviewModel
        .find(baseQuery)
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name thumbnail')
        .populate('userId', 'name avatar');

      const reviewsWithNumber = reviews.map((review, index) => ({
        ...review.toObject(),
        index: skip + index + 1,
      }));

      return {
        success: true,
        data: reviewsWithNumber,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const review = await this.reviewModel.findById(id);
      return {
        success: true,
        data: review,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    try {
      const review = await this.reviewModel.findByIdAndUpdate(
        id,
        updateReviewDto,
      );
      return {
        success: true,
        data: review,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const review = await this.reviewModel.findByIdAndDelete(id);
      return {
        success: true,
        data: review,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(exportFields: any) {
    const { fields, date, isAllDate } = exportFields;

    let query = isAllDate
      ? {}
      : { createdAt: { $gte: date[0], $lte: date[1] } };

    let reviews = await this.reviewModel
      .find(query)
      .populate({
        path: 'userId',
        select: 'name',
        transform: (doc) => (doc ? doc.name : null),
      })
      .populate({
        path: 'productId',
        select: 'name',
        transform: (doc) => (doc ? doc.name : null),
      })
      .lean()
      .exec();

    const data: any[] = reviews.map((review, index) => {
      const transformedReview = {
        ...review,
        userId: review.userId,
        productId: review.productId,
      };

      const { _id, __v, ...rest } = transformedReview;

      return {
        index: index + 1,
        ...rest,
      };
    });

    const total = await this.reviewModel.countDocuments(query);

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
        await this.reviewModel.updateMany(
          { _id: { $in: ids } },
          { active: true },
        );
        break;
      case 'inactivate-all':
        await this.reviewModel.updateMany(
          { _id: { $in: ids } },
          { active: false },
        );
        break;
      case 'delete-all':
        await this.reviewModel.updateMany(
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

  async reply(id: string, reply: string) {
    const review = await this.reviewModel.findByIdAndUpdate(id, {
      replyByAdmin: reply,
    });
    return {
      success: true,
      message: 'Reply successfully',
      data: review,
    };
  }
}
