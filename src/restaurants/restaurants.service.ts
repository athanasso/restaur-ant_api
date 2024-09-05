import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateRestaurantDto } from '../dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from '../dtos/restaurant/update-restaurant.dto';
import { Review } from '../entities/review.entity';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';

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
      throw new BadRequestException('Error creating restaurant');
    }
  }

  async findAll(
    page: number = 1,
    take: number = 10,
  ): Promise<PaginationResponseDto<Restaurant>> {
    try {
      const [restaurants, totalCount] = await Promise.all([
        this.restaurantsRepository.find({
          relations: ['reviews'],
          take,
          skip: (page - 1) * take,
        }),
        this.restaurantsRepository.count(),
      ]);

      const pageCount = Math.ceil(totalCount / take);

      return {
        items: restaurants,
        totalCount,
        page,
        take,
        pageCount,
      };
    } catch (error) {
      throw new BadRequestException('Error fetching restaurants');
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
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error fetching restaurant with id ${id}`);
    }
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantsRepository.findOne({ where: { id } });

      if (!restaurant) {
        throw new NotFoundException(`Restaurant with ID ${id} not found`);
      }

      const { name, phoneNumber, address } = updateRestaurantDto;

      if (name !== undefined) restaurant.name = name;
      if (phoneNumber !== undefined) restaurant.phoneNumber = phoneNumber;
      if (address !== undefined) restaurant.address = address;

      return await this.restaurantsRepository.save(restaurant);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error updating restaurant with ID ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const restaurant = await this.restaurantsRepository.findOne({ where: { id }, relations: ['reviews'] });

      if (!restaurant) {
        throw new NotFoundException(`Restaurant with id ${id} not found`);
      }

      await this.reviewsRepository.delete({ restaurant });

      await this.restaurantsRepository.remove(restaurant);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error deleting restaurant with id ${id}`);
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
