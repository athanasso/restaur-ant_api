import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { UpdateReviewDto } from '../dtos/review/update-review.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const { rating, comment, restaurantId, userId } = createReviewDto;

    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const review = this.reviewsRepository.create({
      rating,
      comment,
      restaurant,
      user,
    });

    try {
      return await this.reviewsRepository.save(review);
    } catch (error) {
      throw new BadRequestException('Failed to create review');
    }
  }

  async findAll(page: number, take: number): Promise<PaginationResponseDto<Review>> {
    try {
      const queryBuilder = this.reviewsRepository.createQueryBuilder('review')
        .leftJoinAndSelect('review.restaurant', 'restaurant')
        .leftJoinAndSelect('review.user', 'user')
        .skip((page - 1) * take)
        .take(take);

      const [reviews, totalCount] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount(),
      ]);

      const pageCount = Math.ceil(totalCount / take);

      return {
        items: reviews,
        totalCount,
        page,
        take,
        pageCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching reviews');
    }
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    let review: Review;

    try {
      review = await this.reviewsRepository.findOne({
        where: { id },
        relations: ['restaurant', 'user'],
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      if (updateReviewDto.userId) {
        const user = await this.userRepository.findOne({ where: { id: updateReviewDto.userId } });
        if (!user) {
          throw new BadRequestException('Invalid user ID');
        }
        review.user = user;
      }

      if (updateReviewDto.restaurantId) {
        const restaurant = await this.restaurantRepository.findOne({ where: { id: updateReviewDto.restaurantId } });
        if (!restaurant) {
          throw new BadRequestException('Invalid restaurant ID');
        }
        review.restaurant = restaurant;
      }

      review.rating = updateReviewDto.rating ?? review.rating;
      review.comment = updateReviewDto.comment ?? review.comment;

      return await this.reviewsRepository.save(review);

    } catch (error) {
      console.log('Error updating review:', error);
      throw new BadRequestException('Failed to update review');
    }
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);

    try {
      await this.reviewsRepository.remove(review);
    } catch (error) {
      throw new BadRequestException('Failed to delete review');
    }
  }

  async findAllByRestaurant(restaurantId: number): Promise<Review[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    try {
      return await this.reviewsRepository.find({
        where: { restaurant },
        relations: ['user'],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve reviews for the restaurant');
    }
  }

  async deleteReview(restaurantId: number, reviewId: number, userId: number): Promise<void> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id: reviewId, restaurant: { id: restaurantId } },
        relations: ['user'],
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (review.user.id !== userId) {
        throw new ForbiddenException('You are not allowed to delete this review');
      }

      await this.reviewsRepository.remove(review);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting review');
    }
  }

  async updateReview(restaurantId: number, reviewId: number, updateReviewDto: UpdateReviewDto, userId: number): Promise<Review> {
    try {
      const review = await this.reviewsRepository.findOne({
        where: { id: reviewId, restaurant: { id: restaurantId } },
        relations: ['user'],
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (review.user.id !== userId) {
        throw new ForbiddenException('You are not allowed to update this review');
      }

      review.rating = updateReviewDto.rating;
      review.comment = updateReviewDto.comment;

      return await this.reviewsRepository.save(review);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating review');
    }
  }
}
