import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from './services/password.service';
import { Credentials } from './entities/credentials.entity';
import { RegisterResponseDto } from './dtos/responses.dto';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Credentials)
    private credentialsRepository: Repository<Credentials>,
    private passwordService: PasswordService,
    private dataSource: DataSource,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, password, name } = registerDto;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('This email is already in use');
    }

    const { valid, errors } = await this.passwordService.validate(password);
    if (!valid) throw new BadRequestException(errors);

    const hashPassword = await this.passwordService.hash(password);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entity = this.userRepository.create({
        email,
        name,
        credentials: {
          passwordHash: hashPassword,
        },
      });

      await queryRunner.manager.save(entity);
      const tokens = await this.tokenService.generateTokens(
        {
          userId: entity.id,
          email: entity.email,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return {
        id: entity.id.toString(),
        email: entity.email,
        name: entity.name,
        tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to register user: ${error}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(
    credentials: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const { email, password } = credentials;
    const existingEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['credentials'],
    });

    if (!existingEntity) {
      throw new BadRequestException('The provided credentials are incorrect');
    }

    const { passwordHash } = existingEntity.credentials;
    const isPasswordCorrect = await this.passwordService.verify(
      password,
      passwordHash,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('The provided credentials are incorrect');
    }

    const tokens = await this.tokenService.generateTokens({
      userId: existingEntity.id,
      email: existingEntity.email,
    });

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return await this.tokenService.refreshToken(refreshToken);
  }

  async logout(email: string): Promise<void> {
    const existingEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['refreshTokens'],
    });

    if (!existingEntity) return;

    for (const refreshToken of existingEntity.refreshTokens) {
      await this.tokenService.deleteToken(refreshToken.jti);
    }
  }
}
