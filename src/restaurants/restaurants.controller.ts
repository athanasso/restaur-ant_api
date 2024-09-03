import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  NotFoundException,
  HttpCode,
  Query,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from '../dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/restaurant/update-restaurant.dto';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { UpdateReviewDto } from '../dtos/review/update-review.dto';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';
import { Restaurant } from '../entities/restaurant.entity';

@Controller('restaurants')
@UseGuards(RolesGuard)
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Roles('admin')
  @Post()
  @HttpCode(201)
  async create(@Body(new ValidationPipe()) createRestaurantDto: CreateRestaurantDto) {
    try {
      return await this.restaurantsService.create(createRestaurantDto);
    } catch (error) {
      throw new BadRequestException('Error creating restaurant');
    }
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('take') take: number = 10,
  ): Promise<PaginationResponseDto<Restaurant>> {
    try {
      return await this.restaurantsService.findAll(page, take);
    } catch (error) {
      throw new BadRequestException('Error fetching restaurants');
    }
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.restaurantsService.findOne(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Restaurant with id ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) updateRestaurantDto: UpdateRestaurantDto) {
    try {
      return await this.restaurantsService.update(parseInt(id, 10), updateRestaurantDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error updating restaurant with id ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.restaurantsService.remove(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error deleting restaurant with id ${id}`);
    }
  }

  @Roles('admin', 'user')
  @Get('/:id/reviews')
  async findAllReviews(@Param('id') id: string) {
    try {
      return await this.reviewsService.findAllByRestaurant(parseInt(id, 10));
    } catch (error) {
      throw new BadRequestException('Error fetching reviews for restaurant');
    }
  }

  @Roles('admin', 'user')
  @Post('/:id/reviews')
  @HttpCode(201)
  async createReview(@Param('id') id: string, @Body(new ValidationPipe()) createReviewDto: CreateReviewDto) {
    try {
      createReviewDto.restaurantId = parseInt(id, 10);
      return await this.reviewsService.createReview(createReviewDto);
    } catch (error) {
      throw new BadRequestException('Error creating review for restaurant');
    }
  }

  @Roles('admin', 'user')
  @Get('/:restaurantId/reviews/:userId')
  async findUserReview(
    @Param('restaurantId') restaurantId: string,
    @Param('userId') userId: string,
  ) {
    try {
      const review = await this.restaurantsService.findUserReviewByRestaurant(parseInt(restaurantId, 10), parseInt(userId, 10));
      if (!review) {
        throw new NotFoundException(`Review for user ${userId} in restaurant ${restaurantId} not found`);
      }
      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error fetching user review for restaurant');
    }
  }

  @Roles('admin', 'user')
  @Delete('/:restaurantId/reviews/:reviewId/:userId')
  async deleteReview(
    @Param('restaurantId') restaurantId: number,
    @Param('reviewId') reviewId: number,
    @Param('userId') userId: number
  ): Promise<void> {
    try {
      await this.reviewsService.deleteReview(restaurantId, reviewId, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting review');
    }
  }

  @Roles('admin', 'user')
  @Put('/:restaurantId/reviews/:reviewId/:userId')
  async updateReview(
    @Param('restaurantId') restaurantId: number,
    @Param('reviewId') reviewId: number,
    @Param('userId') userId: number,
    @Body(new ValidationPipe()) updateReviewDto: UpdateReviewDto,
  ) {
    try {
      return await this.reviewsService.updateReview(restaurantId, reviewId, updateReviewDto, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating review');
    }
  }
}
