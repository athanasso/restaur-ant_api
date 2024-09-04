import { Controller, Post, Body, BadRequestException, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../dtos/auth/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async login(@Body(new ValidationPipe()) user: UserDto) {
    try {
      return await this.authService.login(user);
    } catch (error) {
      throw new BadRequestException('Error logging in');
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async register(@Body(new ValidationPipe()) user: UserDto) {
    try {
      const result = await this.authService.register(user);
      return result;
    } catch (error) {
      throw new BadRequestException('Error registering user');
    }
  }
}