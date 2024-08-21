import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/entities/review.entity';
import { CreateReviewDto } from 'src/dtos/review/create-review.dto';
import { UpdateReviewDto } from 'src/dtos/review/update-review.dto';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';

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

  async findAll(): Promise<Review[]> {
    try {
      return await this.reviewsRepository.find({ relations: ['restaurant', 'user'] });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve reviews');
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
    const review = await this.findOne(id);

    try {
      await this.reviewsRepository.update(id, updateReviewDto);
      return await this.reviewsRepository.findOne({
        where: { id },
        relations: ['restaurant', 'user'],
      });
    } catch (error) {
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
}
