import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async createReview(reviewData: Review): Promise<Review> {
    const newReview = this.reviewsRepository.create(reviewData);
    return await this.reviewsRepository.save(newReview);
  }

  async findAllByRestaurant(restaurantId: number): Promise<Review[]> {
    return await this.reviewsRepository.find({ where: { restaurant: { id: restaurantId } } });
  }
}