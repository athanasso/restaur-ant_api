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
  BadRequestException,
  HttpCode,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { PaginationResponseDto } from '../dtos/pagination-response.dto';
import { SelfGuard } from '../guards/self.guard';

@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/me')
  @UseGuards(SelfGuard)
  async getMe(@Query('id', ParseIntPipe) userId: number): Promise<User> {
    try {
      return await this.userService.findOne(userId);
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }

  @Put('/me')
  @UseGuards(SelfGuard)
  async updateMe(
    @Query('id', ParseIntPipe) userId: number,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userService.update(userId, updateUserDto);
    } catch (error) {
      throw new BadRequestException('Error updating user');
    }
  }

  @Roles('admin')
  @Post()
  @HttpCode(201)
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new BadRequestException('Error creating user');
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
      throw new BadRequestException('Error fetching users');
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
      throw new BadRequestException(`User with ID ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error updating user with ID ${id}`);
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
      throw new BadRequestException(`Error deleting user with ID ${id}`);
    }
  }
}