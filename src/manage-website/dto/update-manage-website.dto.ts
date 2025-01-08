import { PartialType } from '@nestjs/mapped-types';
import { CreateManageWebsiteDto } from './create-manage-website.dto';

export class UpdateManageWebsiteDto extends PartialType(CreateManageWebsiteDto) {}
