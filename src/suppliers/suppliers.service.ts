import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Supplier } from 'src/shared/schema/supplier.schema';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { replaceName } from 'src/helpers/replaceName';
import { brands, fashionProducts } from 'src/helpers/const';
import { convertTime } from 'src/helpers/convertTime';
import { handleFilter } from 'src/helpers/handleFilter';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const newSupplier = await this.supplierModel.create(createSupplierDto);

      return {
        success: true,
        message: 'Supplier created successfully!',
        data: newSupplier,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(page: number, limit: number, query: any) {
    try {
      const skip = (page - 1) * limit;

      const { baseQuery, sort } = handleFilter(query);

      delete baseQuery.isDeleted;

      const total = await this.supplierModel.countDocuments();

      const suppliers = await this.supplierModel
        .find(baseQuery)
        .sort(sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const suppliersWithNumber = suppliers.map((supplier, index) => ({
        ...supplier.toObject(),
        index: skip + index + 1,
      }));

      return {
        success: true,
        data: suppliersWithNumber,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} supplier`;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    try {
      const supplier = await this.supplierModel.findById(id);

      if (!supplier) {
        throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
      }

      const updatedSupplier = await this.supplierModel.findByIdAndUpdate(
        id,
        updateSupplierDto,
        {
          new: true,
        },
      );

      return {
        success: true,
        message: 'Supplier updated successfully!',
        data: updatedSupplier,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const supplier = this.supplierModel.findById(id);

      if (!supplier) {
        throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
      }

      await this.supplierModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Supplier deleted successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fake() {
    try {
      const suppliers = [];
      brands.forEach((element) => {
        suppliers.push({
          name: element.name,
          email: faker.internet.email(),
          slug: replaceName(element.name),
          categories: [],
          contact: `0${faker.number.int({ min: 32, max: 39 })}${faker.string.numeric(7)}`,
          takingReturn: faker.helpers.arrayElement([
            'Taking return',
            'Not taking return',
          ]),
          photoUrl: element.url,
          active: faker.helpers.arrayElement(['Active', 'Inactive']),
          createdAt: faker.date.between({
            from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 ngày trước
            to: new Date(),
          }),
          updatedAt: faker.date.between({
            from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            to: new Date(),
          }),
        });
      });

      // return suppliers;
      await this.supplierModel.insertMany(suppliers);

      return {
        success: true,
        message: 'Suppliers created successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async clearAll() {
    try {
      await this.supplierModel.deleteMany({});

      return {
        success: true,
        message: 'Clear all suppliers successfully!',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async download(exportFields: any) {
    const { fields, date, isAllDate } = exportFields;

    let suppliers = [];
    if (isAllDate) {
      suppliers = await this.supplierModel
        .find()
        .select([...fields, 'createdAt', 'updatedAt']);
    } else {
      suppliers = await this.supplierModel
        .find({
          createdAt: { $gte: date[0], $lte: date[1] },
        })
        .select(fields);
    }

    const data = suppliers.map((supplier, index) => {
      const { _id, id, ...rest } = supplier.toObject();
      return {
        index: index + 1,
        ...rest,
        categories: supplier.categories.join(', '),
      };
    });

    const total = await this.supplierModel.countDocuments();

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
        await this.supplierModel.updateMany(
          { _id: { $in: ids } },
          { active: true },
        );
        break;
      case 'inactivate-all':
        await this.supplierModel.updateMany(
          { _id: { $in: ids } },
          { active: false },
        );
        break;
      case 'delete-all':
        await this.supplierModel.deleteMany({ _id: { $in: ids } });
        break;
    }

    return {
      success: true,
      message: 'Action performed successfully!',
    };
  }
}
