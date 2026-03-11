import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Request,
  UseGuards,
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
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
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
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    return this.authService.login(loginDto);
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
    @Body() body: { refreshToken: string },
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(body.refreshToken);
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
  async logout(@Request() req: { user: { email: string } }): Promise<void> {
    return this.authService.logout(req.user.email);
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
