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
  BadRequestException,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { UpdateReviewDto } from '../dtos/review/update-review.dto';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';
import { Review } from '../entities/review.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Controller('reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles('admin')
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async createReview(@Body(new ValidationPipe()) createReviewDto: CreateReviewDto) {
    try {
      return await this.reviewsService.createReview(createReviewDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
      }
      throw new BadRequestException('Error creating review');
    }
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of reviews' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'take', type: Number, required: false, description: 'Number of reviews to retrieve' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('take') take: number = 10,
  ): Promise<PaginationResponseDto<Review>> {
    try {
      return await this.reviewsService.findAll(page, take);
    } catch (error) {
      throw new BadRequestException('Error fetching reviews');
    }
  }

  @Roles('admin')
  @Get('/:id')
  @ApiOperation({ summary: 'Retrieve a review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.reviewsService.findOne(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Review with id ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  @ApiOperation({ summary: 'Update a review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async update(@Param('id') id: string, @Body(new ValidationPipe()) updateReviewDto: UpdateReviewDto) {
    try {
      return await this.reviewsService.update(parseInt(id, 10), updateReviewDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error updating review with id ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a review by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.reviewsService.remove(parseInt(id, 10));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error deleting review with id ${id}`);
    }
  }
}
