import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Post()
  async createRestaurant(@Body() restaurantData: any) {
    return await this.restaurantsService.createRestaurant(restaurantData);
  }

  @Get()
  async findAll() {
    return await this.restaurantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.restaurantsService.findOne(parseInt(id));
  }
}