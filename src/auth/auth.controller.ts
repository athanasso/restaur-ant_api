import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dtos/auth/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: UserDto) {
    try {
      return await this.authService.login(user);
    } catch (error) {
      throw new BadRequestException('Error logging in');
    }
  }

  @Post('signup')
  async register(@Body() user: UserDto) {
    try {
      const result = await this.authService.register(user);
      return result;
    } catch (error) {
      throw new BadRequestException('Error registering user');
    }
  }
}