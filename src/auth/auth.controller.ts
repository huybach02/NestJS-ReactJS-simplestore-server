import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetMetadata('isPublic', true)
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const registerResponse = await this.authService.register(registerDto);

    if (registerResponse.success) {
      res.cookie('_simplestore_access_token', registerResponse.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
      });
    }

    return registerResponse;
  }

  @SetMetadata('isPublic', true)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResponse = await this.authService.login(loginDto);

    if (loginResponse.success) {
      res.cookie('_simplestore_access_token', loginResponse.access_token, {
        httpOnly: true,
        secure: true, // Yêu cầu HTTPS
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
      });
    }

    return loginResponse;
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('_simplestore_access_token');
    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    return {
      success: true,
      data: req['user'],
    };
  }

  @SetMetadata('isPublic', true)
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const access_token = await this.authService.refreshToken(req);

    res.cookie('_simplestore_access_token', access_token, {
      httpOnly: true,
      secure: true, // Yêu cầu HTTPS
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
    });

    return {
      success: true,
      message: 'Refresh token successful',
    };
  }
}
