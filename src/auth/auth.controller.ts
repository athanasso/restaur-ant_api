import { Controller, Post, Body, BadRequestException, ValidationPipe, ConflictException, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../dtos/auth/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in a user' })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async login(@Body(new ValidationPipe()) user: UserDto) {
    try {
      return await this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      } else {
        throw new BadRequestException('Error logging in');
      }
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  async register(@Body(new ValidationPipe()) user: UserDto) {
    try {
      const result = await this.authService.register(user);
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else {
        throw new BadRequestException('Error registering user');
      }
    }
  }
}