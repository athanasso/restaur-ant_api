import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Restaurant } from '../src/entities/restaurant.entity';
import { Review } from '../src/entities/review.entity';
import { Role } from '../src/enums/Role';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(connection: DataSource) {
  const userRepository = connection.getRepository(User);
  const restaurantRepository = connection.getRepository(Restaurant);
  const reviewRepository = connection.getRepository(Review);

  // Create users
  const usersData = [
    {
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: 'password123',
      role: Role.USER,
    },
    {
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password456',
      role: Role.USER,
    },
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin',
      role: Role.ADMIN,
    }
  ]

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

  const users = userRepository.create(hashedUsers);
  await userRepository.save(users);

  // Create restaurants
  const restaurant1 = restaurantRepository.create({
    name: 'Test Restaurant 1',
    address: '123 Test St',
    phoneNumber: '123123213',
  });
  await restaurantRepository.save(restaurant1);

  const restaurant2 = restaurantRepository.create({
    name: 'Test Restaurant 2',
    address: '456 Example Ave',
    phoneNumber: '321323213',
  });
  await restaurantRepository.save(restaurant2);

  // Create reviews
  const review1 = reviewRepository.create({
    rating: 4,
    comment: 'Great food!',
    user: users[0],
    restaurant: restaurant1,
  });
  await reviewRepository.save(review1);

  const review2 = reviewRepository.create({
    rating: 5,
    comment: 'Excellent service!',
    user: users[1],
    restaurant: restaurant2,
  });
  await reviewRepository.save(review2);
}