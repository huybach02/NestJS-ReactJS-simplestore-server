import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Voucher } from 'src/shared/schema/voucher';
import { Model } from 'mongoose';
import { handleFilter } from 'src/helpers/handleFilter';

@Injectable()
export class VouchersService {
  constructor(
    @InjectModel(Voucher.name) private voucherModel: Model<Voucher>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    try {
      const startDate = new Date(createVoucherDto.startDate);
      const endDate = new Date(createVoucherDto.endDate);

      if (startDate > endDate) {
        throw new HttpException(
          'Start date cannot be greater than end date',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newVoucher = await this.voucherModel.create(createVoucherDto);

      return {
        success: true,
        message: 'Voucher created successfully!',
        data: newVoucher,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page: number, limit: number, query: any) {
    try {
      const skip = (page - 1) * limit;

      const { baseQuery, sort } = handleFilter(query);

      const total = await this.voucherModel.countDocuments(baseQuery);

      const vouchers = await this.voucherModel
        .find(baseQuery)
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const vouchersWithNumber = vouchers.map((voucher, index) => ({
        ...voucher.toObject(),
        index: skip + index + 1,
      }));

      return {
        success: true,
        data: vouchersWithNumber,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} voucher`;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto) {
    try {
      const voucher = await this.voucherModel.findById(id);

      if (!voucher) {
        throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
      }

      const updatedVoucher = await this.voucherModel.findByIdAndUpdate(
        id,
        updateVoucherDto,
        {
          new: true,
        },
      );

      return {
        success: true,
        message: 'Voucher updated successfully!',
        data: updatedVoucher,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const voucher = await this.voucherModel.findById(id);

      if (!voucher) {
        throw new HttpException('Voucher not found', HttpStatus.NOT_FOUND);
      }

      await this.voucherModel.findByIdAndUpdate(id, {
        $set: {
          isDeleted: true,
        },
      });

      return {
        success: true,
        message: 'Voucher deleted successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(exportFields: any) {
    const { fields, date, isAllDate } = exportFields;

    let vouchers = [];
    if (isAllDate) {
      vouchers = await this.voucherModel
        .find()
        .select([...fields, 'createdAt', 'updatedAt']);
    } else {
      vouchers = await this.voucherModel
        .find({
          createdAt: { $gte: date[0], $lte: date[1] },
        })
        .select(fields);
    }

    const data = vouchers.map((voucher, index) => {
      const { _id, id, ...rest } = voucher.toObject();
      return {
        index: index + 1,
        ...rest,
      };
    });

    const total = await this.voucherModel.countDocuments();

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
        await this.voucherModel.updateMany(
          { _id: { $in: ids } },
          { active: true },
        );
        break;
      case 'inactivate-all':
        await this.voucherModel.updateMany(
          { _id: { $in: ids } },
          { active: false },
        );
        break;
      case 'delete-all':
        await this.voucherModel.updateMany(
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
