import { Controller, Post, Body, Get, Put, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from 'src/dtos/user/create-user.dto';
import { UpdateUserDto } from 'src/dtos/user/update-user.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles('admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Roles('admin')
  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Roles('admin', 'user')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Roles('admin', 'user')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}