import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Request,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterResponseDto } from './dtos/responses.dto';
import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been registered successfully',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Validation failed - invalid email format, password too short/long, or invalid name',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<
    Omit<RegisterResponseDto, 'tokens'> & {
      accessToken: string;
      expiresIn: number;
    }
  > {
    const result = await this.authService.register(registerDto);
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      path: '/',
    });

    const { tokens, ...user } = result;
    return {
      ...user,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has been logged in successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { accessToken, refreshToken, expiresIn } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      path: '/',
    });

    return { accessToken, expiresIn };
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh a token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token has been refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const oldRefreshToken = req.cookies['refreshToken'];

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken, expiresIn } =
      await this.authService.refreshToken(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return { accessToken, expiresIn };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User has been logged out successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
  })
  async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<void> {
    await this.authService.logout(req.user.email);
    res.clearCookie('refreshToken', { path: '/' });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current authenticated user',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing token',
  })
  async getMe(
    @Request() req: { user: { id: string; email: string; name: string } },
  ): Promise<{ id: string; email: string; name: string }> {
    return req.user;
  }
}
