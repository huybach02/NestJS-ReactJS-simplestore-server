import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://nest-js-react-js-simplestore-admin.vercel.app',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);

  await app.listen(configService.get('PORT') ?? 3000, () => {
    console.log(`=> => Server is running on port ${configService.get('PORT')}`);
  });
}
bootstrap();
