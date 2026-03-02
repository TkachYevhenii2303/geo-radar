import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Credentials } from './entities/credentials.entity';
import { PasswordService } from './services/password.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './services/token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokens } from './entities/refresh-tokens.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credentials, RefreshTokens]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET as string,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_ACCESS_TTL as string),
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_REFRESH_SECRET as string,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_REFRESH_TTL as string),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    JwtService,
    ConfigService,
  ],
})
export class AuthModule {}
