import { Injectable, NotFoundException } from '@nestjs/common';
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
    const restaurant = this.restaurantsRepository.create(createRestaurantDto);
    return this.restaurantsRepository.save(restaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantsRepository.find({ relations: ['reviews'] });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id },
      relations: ['reviews'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    await this.restaurantsRepository.update(id, updateRestaurantDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantsRepository.remove(restaurant);
  }
}
