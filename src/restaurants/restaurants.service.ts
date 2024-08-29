import { Injectable, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from 'src/entities/restaurant.entity';
import { CreateRestaurantDto } from 'src/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/dtos/restaurant/update-restaurant.dto';
import { Review } from '../entities/review.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    try {
      const createdRestaurant = this.restaurantsRepository.create(createRestaurantDto);
      return await this.restaurantsRepository.save(createdRestaurant);
    } catch (error) {
      throw new InternalServerErrorException('Error creating restaurant');
    }
  }

  async findAll(): Promise<Restaurant[]> {
    try {
      return await this.restaurantsRepository.find({ relations: ['reviews'] });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching restaurants');
    }
  }

  async findOne(id: number): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantsRepository
        .createQueryBuilder('restaurant')
        .leftJoinAndSelect('restaurant.reviews', 'review')
        .leftJoinAndSelect('review.user', 'user')
        .select([
          'restaurant.id',
          'restaurant.name',
          'restaurant.phoneNumber',
          'restaurant.address',
          'restaurant.averageRating',
          'review.id',
          'review.rating',
          'review.comment',
          'review.createdAt',
          'user.id'
        ])
        .where('restaurant.id = :id', { id })
        .getOne();

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      return restaurant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error fetching restaurant with id ${id}`);
    }
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    try {
      await this.restaurantsRepository.update(id, updateRestaurantDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error updating restaurant with id ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const restaurant = await this.findOne(id);
      await this.restaurantsRepository.remove(restaurant);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error deleting restaurant with id ${id}`);
    }
  }

  async findUserReviewByRestaurant(restaurantId: number, userId: number): Promise<Review | null> {
    const review = await this.reviewsRepository.findOne({
      where: {
        restaurant: { id: restaurantId },
        user: { id: userId },
      },
      relations: ['restaurant', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review not found for user ${userId} in restaurant ${restaurantId}`);
    }
    return review;
  }

}
