import { Controller, Post, Body, Param, Get, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from 'src/dtos/review/create-review.dto';
import { UpdateReviewDto } from 'src/dtos/review/update-review.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';

@UseGuards(RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('admin','user')
  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewsService.createReview(createReviewDto);
  }

  @Get()
  async findAll(@Query('restaurantId') restaurantId?: string) {
    if (restaurantId) {
      return this.reviewsService.findAllByRestaurant(parseInt(restaurantId, 10));
    }
    return this.reviewsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(parseInt(id, 10));
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(parseInt(id, 10), updateReviewDto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(parseInt(id, 10));
  }
}