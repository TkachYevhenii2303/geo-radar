import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as crypto from 'crypto';
import { RefreshTokens } from '../entities/refresh-tokens.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

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
    {
      userId,
      email,
    }: {
      userId: string;
      email: string;
    },
    entityManager?: EntityManager,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
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
    const expiresAt = new Date(Date.now() + parseInt(this.refreshTokenTtl));
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

    return this.jwtService.verifyAsync(token, {
      secret: map[type],
    });
  }

  async refreshToken(
    refreshToken: string,
    entityManager?: EntityManager,
  ): Promise<any> {
    const { jti } = await this.verifyToken(refreshToken, tokenType.refresh);
    const refreshTokensRepository =
      entityManager?.getRepository(RefreshTokens) ??
      this.refreshTokensRepository;

    const refreshTokenEntity = await refreshTokensRepository.findOne({
      where: { jti },
    });

    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const existingEntity = await this.userRepository.findOne({
      where: { id: refreshTokenEntity.userId },
      relations: ['refreshTokens'],
      select: ['id', 'email'],
    });

    const { accessToken } = await this.generateTokens({
      userId: existingEntity.id,
      email: existingEntity.email,
    });

    return { accessToken };
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
