import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { RolesGuard } from '../guards/role.guard';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Review } from '../entities/review.entity';
import { SelfGuard } from '../guards/self.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Review]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [UsersService, RolesGuard, Reflector, SelfGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
