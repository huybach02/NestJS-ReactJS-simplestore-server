import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Supplier } from 'src/shared/schema/supplier.schema';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { replaceName } from 'src/helpers/replaceName';
import { brands, fashionProducts } from 'src/helpers/const';

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

  async findAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const total = await this.supplierModel.countDocuments();

      const suppliers = await this.supplierModel
        .find()
        .sort({ createdAt: -1 })
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

  async fake(count: number) {
    try {
      const suppliers = [];
      for (let i = 0; i < count; i++) {
        const brand = faker.helpers.arrayElement(brands);
        suppliers.push({
          name: brand.name,
          email: faker.internet.email(),
          slug: replaceName(brand.name),
          product: faker.helpers.arrayElement(fashionProducts),
          categories: [],
          price: Math.floor(faker.number.int({ min: 1, max: 50 })) * 1000000,
          contact: `0${faker.number.int({ min: 32, max: 39 })}${faker.string.numeric(7)}`,
          isTaking: faker.helpers.arrayElement([0, 1]),
          photoUrl: brand.url,
          active: faker.helpers.arrayElement([true, false]),
        });
      }

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
}
