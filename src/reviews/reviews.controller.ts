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
  HttpCode,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { UpdateReviewDto } from '../dtos/review/update-review.dto';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';
import { Review } from '../entities/review.entity';

@UseGuards(RolesGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('admin')
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

  @Roles('admin')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('take') take: number = 10,
  ): Promise<PaginationResponseDto<Review>> {
    try {
      return await this.reviewsService.findAll(page, take);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching reviews');
    }
  }

  @Roles('admin')
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
