import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from 'src/dtos/restaurant/create-restaurant.dto';
import { UpdateRestaurantDto } from 'src/dtos/restaurant/update-restaurant.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';

@Controller('restaurants')
@UseGuards(RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return await this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  async findAll() {
    return await this.restaurantsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.restaurantsService.findOne(parseInt(id, 10));
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return await this.restaurantsService.update(parseInt(id, 10), updateRestaurantDto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.restaurantsService.remove(parseInt(id, 10));
  }
}
