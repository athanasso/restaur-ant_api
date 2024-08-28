import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findUserByUsername(username);
      if (user && (await this.usersService.comparePassword(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('Error validating user');
    }
  }

  async login(user: any) {
    try {
      const result = await this.validateUser(user.username, user.password);

      if (!result) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        username: user.username,
        sub: result.id,
        role: result.role,
      };

      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '20m',
      });

      return { payload, access_token };
    } catch (error) {
      throw new InternalServerErrorException('Error logging in');
    }
  }

  async register(userData: any) {
    try {
      const user = await this.usersService.createUser(userData);
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Error registering user');
    }
  }
}