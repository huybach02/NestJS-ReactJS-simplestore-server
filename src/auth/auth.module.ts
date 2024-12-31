import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [UsersModule, CartsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
