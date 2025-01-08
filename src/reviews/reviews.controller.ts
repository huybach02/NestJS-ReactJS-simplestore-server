import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  SetMetadata,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/decorators/role.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    return this.reviewsService.create(createReviewDto, req['user']._id);
  }

  @Post('reply/:id')
  reply(@Param('id') id: string, @Body() body: { reply: string }) {
    return this.reviewsService.reply(id, body.reply);
  }

  @SetMetadata('isPublic', true)
  @Get('by-product/:productId')
  findAllByProductId(@Param('productId') productId: string) {
    return this.reviewsService.findAllByProductId(productId);
  }

  @Roles(['admin'])
  @Get()
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('query') query: any,
  ) {
    return this.reviewsService.findAll(+page, +limit, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }

  @Roles(['admin'])
  @Post('download')
  download(@Body() exportFields: any) {
    return this.reviewsService.download(exportFields);
  }

  @Roles(['admin'])
  @Post('action-when-selected')
  actionWhenSelected(@Body() data: any) {
    return this.reviewsService.actionWhenSelected(data);
  }
}
