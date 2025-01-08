import { Module } from '@nestjs/common';
import { ManageWebsiteService } from './manage-website.service';
import { ManageWebsiteController } from './manage-website.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ManageWebsite,
  ManageWebsiteSchema,
} from 'src/shared/schema/manageWebsite.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ManageWebsite.name, schema: ManageWebsiteSchema },
    ]),
  ],
  controllers: [ManageWebsiteController],
  providers: [ManageWebsiteService],
})
export class ManageWebsiteModule {}
