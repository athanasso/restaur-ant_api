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
  ForbiddenException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from 'src/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/dtos/restaurant/update-restaurant.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';
import { ReviewsService } from 'src/reviews/reviews.service';
import { CreateReviewDto } from 'src/dtos/review/create-review.dto';

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
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    try {
      return await this.restaurantsService.create(createRestaurantDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating restaurant');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.restaurantsService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching restaurants');
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
      throw new InternalServerErrorException(`Restaurant with id ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    try {
      return await this.restaurantsService.update(parseInt(id, 10), updateRestaurantDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error updating restaurant with id ${id}`);
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
      throw new InternalServerErrorException(`Error deleting restaurant with id ${id}`);
    }
  }

  @Roles('admin', 'user')
  @Get('/:id/reviews')
  async findAllReviews(@Param('id') id: string) {
    try {
      return await this.reviewsService.findAllByRestaurant(parseInt(id, 10));
    } catch (error) {
      throw new InternalServerErrorException('Error fetching reviews for restaurant');
    }
  }

  @Roles('admin', 'user')
  @Post('/:id/reviews')
  @HttpCode(201)
  async createReview(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto) {
    try {
      createReviewDto.restaurantId = parseInt(id, 10);
      return await this.reviewsService.createReview(createReviewDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating review for restaurant');
    }
  }
}
