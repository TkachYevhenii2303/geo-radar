import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { minutes, Throttle } from '@nestjs/throttler';

@ApiTags('Crawler Controller')
@Controller('crawler')
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name);

  constructor() {}

  @Get('health-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health check',
  })
  async healthCheck(): Promise<{ message: string }> {
    return {
      message: 'Health check',
    };
  }

  @Throttle({ default: { limit: 5, ttl: minutes(1) } })
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Init crawling a website' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Crawling website has been initialized',
  })
  async crawl(@Body() body: { url: string }): Promise<{ message: string }> {
    this.logger.log(`Crawling website: ${body.url}`);
    return {
      message: 'Crawling website initialized',
    };
  }
}
