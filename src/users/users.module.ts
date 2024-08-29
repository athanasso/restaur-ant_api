import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { RolesGuard } from 'src/guards/role.guard';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Review } from 'src/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Review]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '20m' },
    }),
  ],
  providers: [UsersService, RolesGuard, Reflector],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
