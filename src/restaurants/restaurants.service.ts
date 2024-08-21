import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
      const restaurant = this.restaurantsRepository.create(createRestaurantDto);
      return await this.restaurantsRepository.save(restaurant);
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
      const restaurant = await this.restaurantsRepository.findOne({
        where: { id },
        relations: ['reviews'],
      });

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
}
