import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Credentials } from './entities/credentials.entity';
import { RefreshTokens } from './entities/refresh-tokens.entity';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credentials, RefreshTokens]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET as string,
      signOptions: {
        expiresIn: parseInt(process.env.JWT_ACCESS_TTL as string),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, JwtStrategy],
})
export class AuthModule {}
