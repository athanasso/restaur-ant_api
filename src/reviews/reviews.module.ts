import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../guards/role.guard';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { Restaurant } from '../entities/restaurant.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    forwardRef(() => RestaurantsModule),
    TypeOrmModule.forFeature([Review, Restaurant, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [ReviewsService, RolesGuard, Reflector],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
