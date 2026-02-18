import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';

@Module({
  controllers: [CrawlerController],
})
export class CrawlerModule {}
