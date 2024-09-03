import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken'; // Import jsonwebtoken

@Injectable()
export class SelfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    const resourceOwnerId = parseInt(request.query.id, 10) || parseInt(request.body.params.id, 10) || -99;

    let user: User;
    if (token) {
      try {
        // Verify and decode the token
        user = jwt.verify(token, process.env.JWT_SECRET || '') as User;
        request.user = user; // Attach user to request
      } catch (error) {
        console.error('Token verification failed:', error);
        return false;
      }
    }

    if (user && user.id === resourceOwnerId) {
      return true;
    }

    throw new ForbiddenException('You do not have permission to access this resource.');
  }
}
