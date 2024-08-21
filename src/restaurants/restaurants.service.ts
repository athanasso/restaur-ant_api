import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async createRestaurant(restaurantData: Restaurant): Promise<Restaurant> {
    const newRestaurant = this.restaurantsRepository.create(restaurantData);
    return await this.restaurantsRepository.save(newRestaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantsRepository.find();
  }

  async findOne(id: number): Promise<Restaurant | undefined> {
    return await this.restaurantsRepository.findOne({ where: { id } });
  }
}