import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { ManageWebsiteService } from './manage-website.service';
import { CreateManageWebsiteDto } from './dto/create-manage-website.dto';
import { UpdateManageWebsiteDto } from './dto/update-manage-website.dto';

@Controller('manage-website')
export class ManageWebsiteController {
  constructor(private readonly manageWebsiteService: ManageWebsiteService) {}

  @Post()
  create(
    @Body() createManageWebsiteDto: CreateManageWebsiteDto,
    @Query('key') key: string,
  ) {
    return this.manageWebsiteService.create(key, createManageWebsiteDto);
  }

  @Patch()
  update(@Body() data: any, @Query('key') key: string) {
    return this.manageWebsiteService.update(key, data);
  }

  @Get()
  findAll(@Query('key') key: string) {
    return this.manageWebsiteService.findAll(key);
  }

  @SetMetadata('isPublic', true)
  @Get('all')
  getAllManageWebsite() {
    return this.manageWebsiteService.getAllManageWebsite();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.manageWebsiteService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.manageWebsiteService.remove(+id);
  }
}
