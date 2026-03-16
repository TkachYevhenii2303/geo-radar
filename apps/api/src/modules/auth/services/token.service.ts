import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import {
  CredentialsJwtPayload,
  JwtPayload,
  JwtResponse,
} from '../interfaces/jwt-payload.interface';
import { RefreshTokens } from '../entities/refresh-tokens.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as crypto from 'crypto';

const tokenType = {
  access: 'access',
  refresh: 'refresh',
} as const;

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenTtl: string;
  private readonly refreshTokenTtl: string;

  constructor(
    @InjectRepository(RefreshTokens)
    private readonly refreshTokensRepository: Repository<RefreshTokens>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET as string;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;
    this.accessTokenTtl = process.env.JWT_ACCESS_TTL as string;
    this.refreshTokenTtl = process.env.JWT_REFRESH_TTL as string;
  }

  async generateTokens(
    { userId, email }: CredentialsJwtPayload,
    entityManager?: EntityManager,
  ): Promise<JwtResponse> {
    const accessPayload: JwtPayload & {
      jti: string;
      type: typeof tokenType.access;
    } = {
      sub: userId,
      email,
      jti: uuidv4(),
      type: tokenType.access,
    };

    const refreshPayload: JwtPayload & {
      jti: string;
      type: typeof tokenType.refresh;
    } = {
      sub: userId,
      email,
      jti: uuidv4(),
      type: tokenType.refresh,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync<
        JwtPayload & { jti: string; type: typeof tokenType.access }
      >(accessPayload, {
        secret: this.accessTokenSecret,
      }),

      this.jwtService.signAsync<
        JwtPayload & { jti: string; type: typeof tokenType.refresh }
      >(refreshPayload, {
        secret: this.refreshTokenSecret,
        expiresIn: this.parseTtlToMs(this.refreshTokenTtl),
      }),
    ]);

    const refreshTokensRepository =
      entityManager?.getRepository(RefreshTokens) ??
      this.refreshTokensRepository;

    await this.saveToken(
      userId,
      refreshToken,
      refreshPayload.jti,
      refreshTokensRepository,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseTtlToSeconds(this.accessTokenTtl),
    };
  }

  private async saveToken(
    userId: string,
    refreshToken: string,
    jti: string,
    refreshTokensRepository: Repository<RefreshTokens>,
  ): Promise<any> {
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.parseTtlToMs(this.refreshTokenTtl),
    );
    const refreshTokenEntity = refreshTokensRepository.create({
      userId,
      tokenHash,
      jti,
      expiresAt,
    });

    return refreshTokensRepository.save(refreshTokenEntity);
  }

  async verifyToken(
    token: string,
    type: typeof tokenType.access | typeof tokenType.refresh,
  ): Promise<any> {
    const map = {
      [tokenType.access]: this.accessTokenSecret,
      [tokenType.refresh]: this.refreshTokenSecret,
    };

    try {
      return await this.jwtService.verifyAsync(token, {
        secret: map[type],
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Refresh token expired. Please login again.',
        );
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<JwtResponse> {
    const payload = await this.verifyToken(refreshToken, tokenType.refresh);
    const jti = payload.jti;

    const refreshTokensRepository =
      entityManager?.getRepository(RefreshTokens) ??
      this.refreshTokensRepository;

    const refreshTokenEntity = await refreshTokensRepository.findOne({
      where: { jti },
    });

    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Refresh token not found');
    }

    await this.deleteToken(jti);

    const user = await this.userRepository.findOne({
      where: { id: refreshTokenEntity.userId },
      select: ['id', 'email'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.generateTokens(
      {
        userId: user.id,
        email: user.email,
      },
      entityManager,
    );
  }

  async deleteToken(jti: string): Promise<any> {
    return this.refreshTokensRepository.delete({ jti });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseTtlToMs(ttl: string): number {
    const match = ttl.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  private parseTtlToSeconds(ttl: string): number {
    return Math.floor(this.parseTtlToMs(ttl) / 1000);
  }
}
