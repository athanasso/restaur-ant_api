import { Controller, Post, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':restaurantId')
  async createReview(@Param('restaurantId') restaurantId: string, @Body() reviewData: any) {
    return await this.reviewsService.createReview({ ...reviewData, restaurant: { id: parseInt(restaurantId) } });
  }
}