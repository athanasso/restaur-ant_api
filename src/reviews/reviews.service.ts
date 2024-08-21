import { Review } from 'src/entities/review.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const restaurant = await this.restaurantRepository.findOneBy({ id: restaurantId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const review = this.reviewsRepository.create({
      rating,
      comment,
      restaurant,
      user,
    });

    return this.reviewsRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({ relations: ['restaurant', 'user'] });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    await this.reviewsRepository.update(id, updateReviewDto);
    return this.reviewsRepository.findOne({
      where: { id },
      relations: ['restaurant', 'user'],
    });
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewsRepository.remove(review);
  }

  async findAllByRestaurant(restaurantId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['user'],
    });
  }
}
