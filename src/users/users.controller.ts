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
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/me')
  @UseGuards(SelfGuard)
  @ApiOperation({ summary: 'Get current user details' })
  @ApiQuery({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async getMe(@Query('id', ParseIntPipe) userId: number): Promise<User> {
    try {
      return await this.userService.findOne(userId);
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }

  @Put('/me')
  @UseGuards(SelfGuard)
  @ApiOperation({ summary: 'Update current user details' })
  @ApiQuery({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of users' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'take', type: Number, required: false, description: 'Number of users to retrieve' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'Retrieve user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    try {
      return await this.userService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`User with ID ${id} not found`);
    }
  }

  @Roles('admin')
  @Put('/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error updating user with ID ${id}`);
    }
  }

  @Roles('admin')
  @Delete('/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.userService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(`Error deleting user with ID ${id}`);
    }
  }
}