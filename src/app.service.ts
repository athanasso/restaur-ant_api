import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Review } from './entities/review.entity';
import { User } from './entities/user.entity';
import { Role } from './enums/Role';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.clearDatabase();
    const users = await this.createUsers();
    const restaurants = await this.createRestaurants();
    await this.createReviews(users, restaurants);
  }

  private async clearDatabase() {
    await this.reviewRepository.delete({});
    await this.restaurantRepository.delete({});
    await this.userRepository.delete({});
  }

  private async createUsers(): Promise<User[]> {
    const usersData = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: Role.USER,
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin',
        role: Role.ADMIN,
      },
    ];

    // Hash passwords
    const hashedUsers = await Promise.all(
      usersData.map(async (userData) => {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return {
          ...userData,
          password: hashedPassword,
        };
      }),
    );

    const users = this.userRepository.create(hashedUsers);
    return await this.userRepository.save(users);
  }

  private async createRestaurants(): Promise<Restaurant[]> {
    const restaurantsData = [
      {
        name: 'Sushi Place',
        phoneNumber: '123-456-7890',
        address: '123 Sushi St',
      },
      {
        name: 'Pizza House',
        phoneNumber: '098-765-4321',
        address: '456 Pizza Ave',
      },
    ];

    const restaurants = this.restaurantRepository.create(restaurantsData);
    return this.restaurantRepository.save(restaurants);
  }

  private async createReviews(users: User[], restaurants: Restaurant[]) {
    const reviewsData = [
      {
        rating: 4.5,
        comment: 'Great sushi!',
        restaurant: restaurants[0],
        user: users[0],
      },
      {
        rating: 4.0,
        comment: 'Good pizza, but a bit oily.',
        restaurant: restaurants[1],
        user: users[0],
      },
    ];

    const reviews = this.reviewRepository.create(reviewsData);
    await this.reviewRepository.save(reviews);

    // Update the average rating for each restaurant
    for (const restaurant of restaurants) {
      await this.restaurantRepository.save(restaurant);
    }
  }
}
