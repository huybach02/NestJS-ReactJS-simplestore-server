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
import { SocialLoginDto } from './dto/socialLogin.dto';

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
        sameSite: 'none',
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
      sameSite: 'none',
      path: '/',
      maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
    });

    return {
      success: true,
      message: 'Refresh token successful',
    };
  }

  @SetMetadata('isPublic', true)
  @Post('social-login')
  async socialLogin(
    @Body() socialLoginDto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.socialLogin(socialLoginDto);
    if (response.success) {
      res.cookie('_simplestore_access_token', response.access_token, {
        httpOnly: true,
        secure: true, // Yêu cầu HTTPS
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
      });
    }

    return response;
  }

  @SetMetadata('isPublic', true)
  @Post('verify-otp')
  async verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.verifyOtp(body);

    if (response.success) {
      res.cookie('_simplestore_access_token', response.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 24 * 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 ngày)
      });
    }

    return response;
  }

  @SetMetadata('isPublic', true)
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.authService.forgotPassword(body);
  }

  @SetMetadata('isPublic', true)
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; password: string },
  ) {
    return await this.authService.resetPassword(body);
  }
}
