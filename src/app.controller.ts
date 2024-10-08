import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('app')
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/seed')
  @ApiOperation({ summary: 'Seed the database (DEV environment only)' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully.' })
  @ApiResponse({ status: 400, description: 'Seeding not allowed in this environment.' })
  async seed() {
    console.log(this.configService.get('NODE_ENV'));
    if (this.configService.get('NODE_ENV') === 'DEV') {
      return await this.appService.seed();
    }
    return false;
  }
}
