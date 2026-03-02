import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class TypeOrmConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt((process.env.DATABASE_PORT as string) || '5432'),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: ['dist/modules/**/*.entity{.ts,.js}'],
      migrations: ['dist/configs/database/migrations/*.{js,ts}'],
      migrationsTableName: 'migrations',
      migrationsRun: false,
      synchronize: true,
      logging: true,
    };
  }
}
