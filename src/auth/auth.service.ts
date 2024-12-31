import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword, hashPassword } from 'src/helpers/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/shared/schema/user.schema';
import { Request } from 'express';
import { SocialLoginDto } from './dto/socialLogin.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { sendForgotPasswordEmail, sendUserOtpEmail } from 'src/helpers/mail';
import { CartsService } from 'src/carts/carts.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
    private cartsService: CartsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
      otpExpired: new Date(Date.now() + 10 * 60 * 1000),
    });

    sendUserOtpEmail(user.data.email, user.data.otp, this.mailerService);

    const userResponse = user.data.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    await this.cartsService.createCart({
      userId: user.data._id.toString(),
    });

    return {
      success: true,
      message: 'Please check your email to verify your account',
      data: userResponse,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(
      loginDto.email,
      '+password',
    );

    if (!user) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role !== 'admin' && user.accountType === 'manual') {
      if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpired = new Date(Date.now() + 10 * 60 * 1000);

        await this.usersService.update(user._id.toString(), {
          otp,
          otpExpired,
        });

        sendUserOtpEmail(user.email, otp, this.mailerService);

        return {
          success: false,
          message: 'Please check your email to verify your account',
          data: user.toJSON(),
        };
      }
    }

    const expiresIn = loginDto.remember ? '30d' : '3d';

    const { access_token, refresh_token } = await this.generateTokens(
      user,
      expiresIn,
    );

    await this.usersService.update(user._id.toString(), {
      refreshToken: refresh_token,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    return {
      success: true,
      message: 'Login successful',
      data: userResponse,
      access_token,
    };
  }

  async refreshToken(req: any) {
    try {
      const token = req.cookies['_simplestore_access_token'];
      const decoded = this.jwtService.decode(token);
      const user = await this.usersService.findOneByEmail(
        decoded.email,
        '+refreshToken',
      );
      if (!user) {
        throw new HttpException(
          'Token is invalid or expired',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (user.refreshToken) {
        const verify = this.jwtService.verify(user.refreshToken);
        if (verify) {
          const { access_token } = await this.generateTokens(user);
          return access_token;
        }
      } else {
        throw new HttpException('Please login again', HttpStatus.UNAUTHORIZED);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Token is invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const user = await this.usersService.findOneByEmail(socialLoginDto.email);
    if (!user) {
      const data = {
        ...socialLoginDto,
        password: uuidv4(),
      };

      const user = await this.usersService.create(data);

      const { access_token, refresh_token } = await this.generateTokens(
        user.data,
        '7d',
      );

      await this.usersService.update(user.data._id.toString(), {
        refreshToken: refresh_token,
      });

      await this.cartsService.createCart({
        userId: user.data._id.toString(),
      });

      return {
        success: true,
        message: 'Login successful',
        data: user.data,
        access_token,
      };
    } else {
      const { access_token, refresh_token } = await this.generateTokens(user);

      await this.usersService.update(user._id.toString(), {
        refreshToken: refresh_token,
      });

      return {
        success: true,
        message: 'Login successful',
        data: user,
        access_token,
      };
    }
  }

  async verifyOtp(body: { email: string; otp: string }) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.otp !== body.otp) {
      throw new HttpException('OTP is incorrect', HttpStatus.BAD_REQUEST);
    }

    if (user.otpExpired < new Date()) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    const { access_token, refresh_token } = await this.generateTokens(user);

    await this.usersService.update(user._id.toString(), {
      refreshToken: refresh_token,
      isVerified: true,
      otp: null,
      otpExpired: null,
    });

    return {
      success: true,
      message: 'OTP is correct',
      data: user,
      access_token,
    };
  }

  async forgotPassword(body: { email: string }) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.usersService.update(user._id.toString(), {
      otp,
      otpExpired: new Date(Date.now() + 10 * 60 * 1000),
    });

    sendForgotPasswordEmail(user.email, otp, this.mailerService);

    return {
      success: true,
      message: 'Reset password email sent to email',
    };
  }

  async resetPassword(body: { email: string; otp: string; password: string }) {
    const user = await this.usersService.findOneByEmail(body.email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.otp !== body.otp) {
      throw new HttpException('OTP is incorrect', HttpStatus.BAD_REQUEST);
    }

    if (user.otpExpired < new Date()) {
      throw new HttpException('OTP has expired', HttpStatus.BAD_REQUEST);
    }

    await this.usersService.update(user._id.toString(), {
      password: await hashPassword(body.password),
      otp: null,
      otpExpired: null,
    });

    return {
      success: true,
      message: 'Password reset successful. Please login again.',
    };
  }

  async generateTokens(user: User, expiresIn: string = '3d') {
    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn,
    });

    return { access_token, refresh_token };
  }
}
