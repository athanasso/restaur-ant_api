import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from 'src/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/guards/role.guard';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [ReviewsService, RolesGuard, Reflector],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
