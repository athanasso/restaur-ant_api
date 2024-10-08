import { forwardRef, Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from '../entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from '../guards/role.guard';
import { Reflector } from '@nestjs/core';
import { ReviewsModule } from '../reviews/reviews.module';
import { Review } from '../entities/review.entity';

@Module({
  imports: [
    forwardRef(() => ReviewsModule),
    TypeOrmModule.forFeature([Restaurant, Review]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [RestaurantsService, RolesGuard, Reflector],
  controllers: [RestaurantsController],
})
export class RestaurantsModule {}
