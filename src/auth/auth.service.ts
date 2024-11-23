import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from 'src/helpers/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/shared/schema/user.schema';
import { Request } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { access_token, refresh_token } = await this.generateTokens(
      user.data,
    );

    await this.usersService.update(user.data._id.toString(), {
      refreshToken: refresh_token,
    });

    const userResponse = user.data.toJSON();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      success: true,
      message: 'Register successful',
      data: userResponse,
      access_token,
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
          'Token không chính xác hoặc đã hết hạn',
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
        throw new HttpException(
          'Vui lòng đăng nhập lại',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(
        'Token không chính xác hoặc đã hết hạn',
        HttpStatus.UNAUTHORIZED,
      );
    }
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
