import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	INestApplication,
	Post,
	ValidationPipe
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Test, TestingModule} from '@nestjs/testing';
import {IsInt, IsNotEmpty, IsString} from 'class-validator';
import {Transform} from 'class-transformer';
import request from 'supertest';
import {applyGlobalConfig} from '@/nest-modules/global_config';
import {
	WrapperDataInterceptor
} from '@/nest-modules/shared/interceptors/wrapper_data/wrapper_data.interceptor.service';
import {EntityValidationErrorFilter} from '@/nest-modules/shared/filters/entity_validation_error.filter';
import {NotFoundErrorFilter} from '@/nest-modules/shared/filters/not_found_error.filter';
import {EntityValidationError} from '@core/@shared/domain/validators/validation.error';
import {NotFoundError} from '@core/@shared/domain/errors/not_found.error';
import {Category} from '@core/category/domain/category.aggregate';

class StubDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsInt()
	@IsNotEmpty()
	type: number;
}

class StubPresenter {
	name: string;

	@Transform(({value}: {value: Date}) => value.toISOString())
	created_at: Date;

	constructor(name: string, created_at: Date) {
		this.name = name;
		this.created_at = created_at;
	}
}

const STUB_DATE = new Date('2026-07-29T12:00:00.000Z');

@Controller('stub')
class StubController {
	@Post()
	create(@Body() dto: StubDto) {
		return new StubPresenter(dto.name, STUB_DATE);
	}

	@Post('transform')
	transform(@Body() dto: StubDto) {
		return {is_instance: dto instanceof StubDto};
	}

	@Get('collection')
	collection() {
		return {
			data: [new StubPresenter('a', STUB_DATE)],
			meta: {current_page: 1}
		};
	}

	@Get('entity-validation-error')
	entityValidationError() {
		throw new EntityValidationError([{name: ['name is required']}]);
	}

	@Get('not-found-error')
	notFoundError() {
		throw new NotFoundError('fake-id', Category);
	}
}

describe('applyGlobalConfig Unit Tests', () => {
	describe('registration', () => {
		it('should register the global pipe, interceptors and filters', () => {
			const reflector = new Reflector();
			const app = {
				useGlobalPipes: jest.fn(),
				useGlobalInterceptors: jest.fn(),
				useGlobalFilters: jest.fn(),
				get: jest.fn().mockReturnValue(reflector)
			};

			applyGlobalConfig(app as unknown as INestApplication);

			expect(app.get).toHaveBeenCalledWith(Reflector);

			const [pipe] = app.useGlobalPipes.mock.calls[0];
			expect(pipe).toBeInstanceOf(ValidationPipe);

			const [wrapperInterceptor, serializerInterceptor] =
				app.useGlobalInterceptors.mock.calls[0];
			expect(wrapperInterceptor).toBeInstanceOf(WrapperDataInterceptor);
			expect(serializerInterceptor).toBeInstanceOf(ClassSerializerInterceptor);

			const [entityValidationFilter, notFoundFilter] = app.useGlobalFilters.mock.calls[0];
			expect(entityValidationFilter).toBeInstanceOf(EntityValidationErrorFilter);
			expect(notFoundFilter).toBeInstanceOf(NotFoundErrorFilter);
		});
	});

	describe('behavior', () => {
		let app: INestApplication;

		beforeEach(async () => {
			const moduleFixture: TestingModule = await Test.createTestingModule({
				controllers: [StubController]
			}).compile();
			app = moduleFixture.createNestApplication();
			applyGlobalConfig(app);
			await app.init();
		});

		afterEach(async () => {
			await app.close();
		});

		it('should wrap a plain response into a data property and serialize it', () => {
			return request(app.getHttpServer())
				.post('/stub')
				.send({name: 'John Doe', type: 1})
				.expect(201)
				.expect({
					data: {
						name: 'John Doe',
						created_at: STUB_DATE.toISOString()
					}
				});
		});

		it('should not wrap a response that already has a meta property', () => {
			return request(app.getHttpServer())
				.get('/stub/collection')
				.expect(200)
				.expect({
					data: [{name: 'a', created_at: STUB_DATE.toISOString()}],
					meta: {current_page: 1}
				});
		});

		it('should return 422 instead of 400 when the body is invalid', () => {
			return request(app.getHttpServer())
				.post('/stub')
				.send({})
				.expect(422)
				.expect((res) => {
					expect(res.body.statusCode).toBe(422);
					expect(res.body.error).toBe('Unprocessable Entity');
					expect(res.body.message).toEqual(
						expect.arrayContaining([
							'name should not be empty',
							'name must be a string',
							'type must be an integer number'
						])
					);
				});
		});

		it('should transform the body into an instance of the dto class', () => {
			// `transform: true` entrega ao controller uma instância do DTO,
			// não um objeto literal
			return request(app.getHttpServer())
				.post('/stub/transform')
				.send({name: 'John Doe', type: 1})
				.expect(201)
				.expect({data: {is_instance: true}});
		});

		it('should not convert types implicitly', () => {
			// `transform: true` sozinho não habilita `enableImplicitConversion`,
			// então um `type` numérico em string continua reprovando no @IsInt
			return request(app.getHttpServer())
				.post('/stub')
				.send({name: 'John Doe', type: '1'})
				.expect(422)
				.expect((res) => {
					expect(res.body.message).toStrictEqual(['type must be an integer number']);
				});
		});

		it('should catch an EntityValidationError with 422', () => {
			return request(app.getHttpServer())
				.get('/stub/entity-validation-error')
				.expect(422)
				.expect({
					statusCode: 422,
					error: 'Unprocessable Entity',
					message: ['name is required']
				});
		});

		it('should catch a NotFoundError with 404', () => {
			return request(app.getHttpServer())
				.get('/stub/not-found-error')
				.expect(404)
				.expect({
					statusCode: 404,
					error: 'Not Found',
					message: 'Category Not found using ID fake-id'
				});
		});
	});
});
