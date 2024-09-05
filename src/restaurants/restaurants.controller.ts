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
import { Roles } from '../decorators/roles.decorator';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { UpdateReviewDto } from '../dtos/review/update-review.dto';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Controller('restaurants')
@ApiTags('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Roles('admin')
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body(new ValidationPipe()) createRestaurantDto: CreateRestaurantDto) {
    try {
      return await this.restaurantsService.create(createRestaurantDto);
    } catch (error) {
      throw new BadRequestException('Error creating restaurant');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of restaurants' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'take', type: Number, required: false, description: 'Number of restaurants to retrieve' })
  @ApiResponse({ status: 200, description: 'Restaurants retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async findAll(
    @Query('page') page: string = "1",
    @Query('take') take: string = "10",
  ): Promise<PaginationResponseDto<Restaurant>> {
    try {
      return await this.restaurantsService.findAll(parseInt(page, 10), parseInt(take, 10));
    } catch (error) {
      throw new BadRequestException('Error fetching restaurants');
    }
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Retrieve a restaurant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.restaurantsService.findOne(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Restaurant with ID ${id} not found`);
      }
      throw new BadRequestException(error.message || `Error fetching restaurant with ID ${id}`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  @ApiOperation({ summary: 'Update a restaurant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  async update(@Param('id') id: string, @Body(new ValidationPipe()) updateRestaurantDto: UpdateRestaurantDto) {
    try {
      return await this.restaurantsService.update(parseInt(id, 10), updateRestaurantDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error updating restaurant with id ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a restaurant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Restaurant ID' })
  @ApiResponse({ status: 204, description: 'Restaurant deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.restaurantsService.remove(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error deleting restaurant with id ${id}`);
    }
  }

  @Roles('admin', 'user')
  @Get('/:id/reviews')
  @ApiOperation({ summary: 'Retrieve all reviews for a restaurant' })
  @ApiParam({ name: 'id', type: String, description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'Create a review for a restaurant' })
  @ApiParam({ name: 'id', type: String, description: 'Restaurant ID' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'Retrieve a user\'s review for a restaurant' })
  @ApiParam({ name: 'restaurantId', type: String, description: 'Restaurant ID' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
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
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Error fetching user review for restaurant');
    }
  }

  @Roles('admin', 'user')
  @HttpCode(204)
  @Delete('/:restaurantId/reviews/:reviewId/:userId')
  @ApiOperation({ summary: 'Delete a user\'s review for a restaurant' })
  @ApiParam({ name: 'restaurantId', type: Number, description: 'Restaurant ID' })
  @ApiParam({ name: 'reviewId', type: Number, description: 'Review ID' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async deleteReview(
    @Param('restaurantId') restaurantId: number,
    @Param('reviewId') reviewId: number,
    @Param('userId') userId: number
  ): Promise<void> {
    try {
      await this.reviewsService.deleteReview(restaurantId, reviewId, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Error deleting review');
    }
  }

  @Roles('admin', 'user')
  @Put('/:restaurantId/reviews/:reviewId/:userId')
  @ApiOperation({ summary: 'Update a user\'s review for a restaurant' })
  @ApiParam({ name: 'restaurantId', type: Number, description: 'Restaurant ID' })
  @ApiParam({ name: 'reviewId', type: Number, description: 'Review ID' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
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
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Error updating review');
    }
  }
}
