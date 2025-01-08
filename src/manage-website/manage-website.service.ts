import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { ManageWebsite } from 'src/shared/schema/manageWebsite.schema';
import { Model } from 'mongoose';
import { CreateManageWebsiteDto } from './dto/create-manage-website.dto';

@Injectable()
export class ManageWebsiteService {
  constructor(
    @InjectModel(ManageWebsite.name)
    private manageWebsiteModel: Model<ManageWebsite>,
  ) {}

  async create(key: string, createManageWebsiteDto: CreateManageWebsiteDto) {
    let websiteData = await this.manageWebsiteModel.findOne();
    if (!websiteData) {
      websiteData = new this.manageWebsiteModel();
    }

    switch (key) {
      case 'homeSlider':
        if (websiteData.homeSlider.length === 8) {
          throw new HttpException(
            'Home slider has reached the maximum limit of 8 items',
            HttpStatus.BAD_REQUEST,
          );
        }

        websiteData.homeSlider.push({
          ...createManageWebsiteDto.homeSlider,
          order: websiteData.homeSlider.length + 1,
        });

        await websiteData.save();
        return {
          success: true,
          message: 'Home slider created successfully',
        };

      case 'homeCommitment':
        websiteData.homeCommitment.push(createManageWebsiteDto.homeCommitment);
        await websiteData.save();
        return {
          success: true,
          message: 'Home commitment created successfully',
        };

      case 'productQuestionAnswer':
        websiteData.productQuestionAnswer.push(
          createManageWebsiteDto.productQuestionAnswer,
        );
        await websiteData.save();
        return {
          success: true,
          message: 'Product question & answer created successfully',
        };

      case 'aboutUsContent':
        websiteData.aboutUsContent = createManageWebsiteDto.aboutUsContent;
        await websiteData.save();
        return {
          success: true,
          message: 'About us content created successfully',
        };
    }
  }

  async update(key: string, data: any) {
    const websiteData = await this.manageWebsiteModel.findOne();
    websiteData[key] = data;
    await websiteData.save();
    return {
      success: true,
      message: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
        return str.toUpperCase();
      })} updated successfully`,
    };
  }

  async findAll(key: string) {
    const websiteData = await this.manageWebsiteModel.findOne();

    return {
      success: true,
      data: websiteData[key],
    };
  }

  async getAllManageWebsite() {
    const websiteData = await this.manageWebsiteModel.findOne();
    return {
      success: true,
      data: websiteData,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} manageWebsite`;
  }

  remove(id: number) {
    return `This action removes a #${id} manageWebsite`;
  }
}
