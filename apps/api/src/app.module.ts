import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './configs/database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfig }),
    HealthModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
