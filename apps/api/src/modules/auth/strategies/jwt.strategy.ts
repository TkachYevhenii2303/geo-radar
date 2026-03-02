import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RegisterResponseDto } from '../dtos/responses.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET as string,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<Omit<RegisterResponseDto, 'tokens'>> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, email: payload.email },
      select: ['id', 'email', 'name'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name || null,
    };
  }
}
