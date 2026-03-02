import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Headers,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiResponse } from '@nestjs/swagger';
import { RegisterDto } from './dtos/register.dto';
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
  async login(@Body() credentials: any): Promise<{ accessToken: string }> {
    return this.authService.login(credentials);
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
    @Body() refreshToken: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}
