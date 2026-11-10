import {
	ClassSerializerInterceptor, HttpStatus,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {WrapperDataInterceptor} from "@/nest-modules/shared_module/interceptors/wrapper_data/wrapper_data.interceptor.service";
import {EntityValidationErrorFilter} from "@/nest-modules/shared_module/filters/entity_validation_error.filter";
import {NotFoundErrorFilter} from "@/nest-modules/shared_module/filters/not_found_error.filter";

export function applyGlobalConfig(app: INestApplication) {
	app.useGlobalPipes(
		new ValidationPipe({
			errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			transform: true
		})
	);
	app.useGlobalInterceptors(
		new WrapperDataInterceptor(),
		new ClassSerializerInterceptor(app.get(Reflector))
	);
	app.useGlobalFilters(
		new EntityValidationErrorFilter(),
		new NotFoundErrorFilter()
	);
}
