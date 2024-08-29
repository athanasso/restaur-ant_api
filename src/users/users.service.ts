import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from 'src/dtos/user/update-user.dto';
import { CreateUserDto } from 'src/dtos/user/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Review } from 'src/entities/review.entity';
import { PaginationResponseDto } from 'src/dtos/pagination-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = this.usersRepository.create({ ...userData, password: hashedPassword });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.usersRepository.findOne({ where: { username } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by username');
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new InternalServerErrorException('Error comparing password');
    }
  }

  async findAll(
    page: number = 1,
    take: number = 10,
  ): Promise<PaginationResponseDto<User>> {
    try {
      const [users, totalCount] = await Promise.all([
        this.usersRepository.find({
          take,
          skip: (page - 1) * take,
        }),
        this.usersRepository.count(),
      ]);

      const pageCount = Math.ceil(totalCount / take);

      return {
        items: users,
        totalCount,
        page,
        take,
        pageCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error fetching user with ID ${id}`);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.usersRepository.update(id, updateUserDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error updating user with ID ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.usersRepository.findOne({ where: { id }, relations: ['reviews'] });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (user.reviews && user.reviews.length > 0) {
        await this.reviewsRepository.delete({ user: { id } });
      }
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error deleting user with ID ${id}`);
    }
  }
}