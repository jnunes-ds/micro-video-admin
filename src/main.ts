import {NestFactory, Reflector} from '@nestjs/core';
import {AppModule} from './app.module';
import {ClassSerializerInterceptor, HttpStatus, ValidationPipe} from "@nestjs/common";
import {NotFoundFilter} from "@/nest-modules/shared/not_found/not_found_error.filter";
import {WrapperDataInterceptor} from "@/nest-modules/shared/interceptors/wrapper_data/wrapper_data.interceptor.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new WrapperDataInterceptor());
  app.useGlobalFilters(new NotFoundFilter());

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
