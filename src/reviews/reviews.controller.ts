import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from 'src/dtos/review/create-review.dto';
import { UpdateReviewDto } from 'src/dtos/review/update-review.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';

@UseGuards(RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('admin', 'user')
  @Post()
  @HttpCode(201)
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    try {
      return await this.reviewsService.createReview(createReviewDto);
    } catch (error) {
      if (error.response) {
        throw new ForbiddenException(error.response);
      }
      throw new InternalServerErrorException('Error creating review');
    }
  }

  @Get()
  async findAll(@Query('restaurantId') restaurantId?: string) {
    try {
      if (restaurantId) {
        return await this.reviewsService.findAllByRestaurant(parseInt(restaurantId, 10));
      }
      return await this.reviewsService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Error finding reviews');
    }
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.reviewsService.findOne(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Review with id ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    try {
      return await this.reviewsService.update(parseInt(id, 10), updateReviewDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error updating review with id ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.reviewsService.remove(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error deleting review with id ${id}`);
    }
  }
}
