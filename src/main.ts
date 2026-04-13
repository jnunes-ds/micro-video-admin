import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {ClassSerializerInterceptor, HttpStatus, ValidationPipe} from "@nestjs/common";
import {WrapperDataInterceptor} from "@/nest-modules/shared/interceptors/wrapper-data/wrapper-data.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new WrapperDataInterceptor())

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
