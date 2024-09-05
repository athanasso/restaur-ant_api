import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDto } from '../dtos/auth/user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string) {
    try {
      const user = await this.usersService.findUserByUsername(username);
      if (user && (await this.usersService.comparePassword(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw new BadRequestException('Error validating user');
    }
  }

  async login(user: UserDto) {
    try {
      const result = await this.validateUser(user.username, user.password);

      if (!result) {
        throw new UnauthorizedException('Invalid credentials');
      }

      let payload = {
        username: user.username,
        id: result.id,
        role: result.role,
        accessToken: '',
      };

      const access_token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '20m',
      });

      payload = { ...payload, accessToken: access_token };

      return { payload };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new BadRequestException('Error logging in');
    }
  }

  async register(user: UserDto) {
    try {
      const existingUser = await this.usersService.findUserByUsername(user.username);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const newUser = await this.usersService.createUser(user);

      return {
        success: true,
        message: 'User registered successfully',
        data: newUser.id,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException('Error registering user');
    }
  }
}