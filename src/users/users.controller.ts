import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/dtos/user/create-user.dto';
import { UpdateUserDto } from 'src/dtos/user/update-user.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';
import { PaginationResponseDto } from 'src/dtos/pagination-response.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles('admin')
  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Roles('admin')
  @Get()
  async findAll( 
    @Query('page') page: number = 1,
    @Query('take') take: number = 10,
  ): Promise<PaginationResponseDto<User>> {
    try {
      return await this.userService.findAll(page, take);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  @Roles('admin')
  @Get('/:id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`User with ID ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error updating user with ID ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.userService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error deleting user with ID ${id}`);
    }
  }
}