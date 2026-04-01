import { Test } from '@nestjs/testing';
import { join } from 'path';
import {ConfigModule, validationSchema} from "@/nest-modules/config/config.module";

function expectValidate(schema: any, value: any, key?: string) {
	const result = schema.safeParse(value);
	const issues = result.success ? [] : result.error.issues;
	const filteredIssues = key ? issues.filter(i => i.path.includes(key)) : issues;
	return expect(JSON.stringify(filteredIssues));
}

describe('Schema Unit Tests', () => {
	describe('DB Schema', () => {
		const schema = validationSchema;

		describe('DB_VENDOR', () => {
			test('invalid cases', () => {
				expectValidate(schema, {}, 'DB_VENDOR').toContain('Invalid input: expected string, received undefined');

				expectValidate(schema, { DB_VENDOR: 'batata' }, 'DB_VENDOR').toContain(
					JSON.stringify('Invalid option: expected one of "mysql"|"sqlite"'),
				);
			});

			test('valid cases', () => {
				const arrange = ['mysql', 'sqlite'];

				arrange.forEach((value) => {
					expectValidate(schema, {
						DB_VENDOR: value,
						DB_DATABASE: 'some value',
						DB_USERNAME: 'some name',
						DB_PASSWORD: 'some password',
						DB_PORT: 'some port'

					}).not.toContain(
						'DB_VENDOR',
					);
				});
			});
		});

		describe('DB_HOST', () => {
			test('invalid cases', () => {
				expectValidate(schema, {}, 'DB_HOST').toContain('Invalid input: expected string, received undefined');

				expectValidate(schema, { DB_HOST: 1 }, 'DB_HOST').toContain(
					'Invalid input: expected string, received number',
				);
			});

			test('valid cases', () => {
				const arrange = ['some value'];

				arrange.forEach((value) => {
					expectValidate(schema, { DB_HOST: value }, 'DB_HOST').not.toContain('DB_HOST');
				});
			});
		});

		describe('DB_DATABASE', () => {
			test('invalid cases', () => {
				expectValidate(schema, { DB_VENDOR: 'sqlite' }, 'DB_DATABASE').not.toContain(
					'DB_DATABASE is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_VENDOR: 'mysql' }, 'DB_DATABASE' ).toContain(
					'DB_DATABASE is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_DATABASE: 1 }, 'DB_DATABASE').toContain(
					'Invalid input: expected string, received number',
				);
			});

			test('valid cases', () => {
				const arrange = [
					{ DB_VENDOR: 'sqlite' },
					{ DB_VENDOR: 'sqlite', DB_DATABASE: 'some value' },
					{ DB_VENDOR: 'mysql', DB_DATABASE: 'some value' },
				];

				arrange.forEach((value) => {
					expectValidate(schema, value).not.toContain('DB_DATABASE');
				});
			});
		});

		describe('DB_USERNAME', () => {
			test('invalid cases', () => {
				expectValidate(schema, { DB_VENDOR: 'sqlite' }, 'DB_USERNAME').not.toContain(
					'DB_USERNAME is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_VENDOR: 'mysql' }, 'DB_USERNAME').toContain(
					'DB_USERNAME is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_USERNAME: 1 }, 'DB_USERNAME').toContain(
					'Invalid input: expected string, received number',
				);
			});

			test('valid cases', () => {
				const arrange = [
					{ DB_VENDOR: 'sqlite' },
					{ DB_VENDOR: 'sqlite', DB_USERNAME: 'some value' },
					{ DB_VENDOR: 'mysql', DB_USERNAME: 'some value' },
				];

				arrange.forEach((value) => {
					expectValidate(schema, value).not.toContain('DB_USERNAME');
				});
			});
		});

		describe('DB_PASSWORD', () => {
			test('invalid cases', () => {
				expectValidate(schema, { DB_VENDOR: 'sqlite' }, 'DB_PASSWORD').not.toContain(
					'DB_PASSWORD is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_VENDOR: 'mysql' }, 'DB_PASSWORD').toContain(
					'DB_PASSWORD is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_PASSWORD: 1 }, 'DB_PASSWORD').toContain(
					'Invalid input: expected string, received number',
				);
			});

			test('valid cases', () => {
				const arrange = [
					{ DB_VENDOR: 'sqlite' },
					{ DB_VENDOR: 'sqlite', DB_PASSWORD: 'some value' },
					{ DB_VENDOR: 'mysql', DB_PASSWORD: 'some value' },
				];

				arrange.forEach((value) => {
					expectValidate(schema, value).not.toContain('DB_PASSWORD');
				});
			});
		});

		describe('DB_PORT', () => {
			test('invalid cases', () => {
				expectValidate(schema, { DB_VENDOR: 'sqlite' }, 'DB_PORT').not.toContain(
					'DB_PORT is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_VENDOR: 'mysql' }, 'DB_PORT').toContain(
					'DB_PORT is required when DB_VENDOR is mysql',
				);

				expectValidate(schema, { DB_PORT: 'a' }, 'DB_PORT').toContain(
					'Invalid input: expected number, received NaN',
				);


			});

			test('valid cases', () => {
				const arrange = [
					{ DB_VENDOR: 'sqlite' },
					{ DB_VENDOR: 'sqlite', DB_PORT: 10 },
					{ DB_VENDOR: 'sqlite', DB_PORT: '10' },
					{ DB_VENDOR: 'mysql', DB_PORT: 10 },
					{ DB_VENDOR: 'mysql', DB_PORT: '10' },
				];

				arrange.forEach((value) => {
					expectValidate(schema, value).not.toContain('DB_PORT');
				});
			});
		});

		describe('DB_LOGGING', () => {
			test('invalid cases', () => {
				expectValidate(schema, {}, 'DB_LOGGING').toBe("[]");

				expectValidate(schema, { DB_LOGGING: 'a' }, 'DB_LOGGING').toBe("[]");
			});

			test('valid cases', () => {
				const arrange = [true, false, 'true', 'false'];

				arrange.forEach((value) => {
					expectValidate(schema, { DB_LOGGING: value }).not.toContain(
						'DB_LOGGING',
					);
				});
			});
		});

		describe('DB_AUTO_LOAD_MODELS', () => {
			test('invalid cases', () => {
				expectValidate(schema, {},"DB_AUTO_LOAD_MODELS").toContain(
					'DB_AUTO_LOAD_MODELS is required',
				);

				expectValidate(schema, { DB_AUTO_LOAD_MODELS: "NOT_BOOLEAN" }, "DB_AUTO_LOAD_MODELS").toContain(
					'DB_AUTO_LOAD_MODELS must be a boolean',
				);
			});

			test('valid cases', () => {
				const arrange = [true, false, 'true', 'false'];

				arrange.forEach((value) => {
					expectValidate(schema, { DB_AUTO_LOAD_MODELS: value }).not.toContain(
						'DB_AUTO_LOAD_MODELS',
					);
				});
			});
		});
	});
});

describe('ConfigModule Unit Tests', () => {
	it('should throw an error when env vars are invalid', () => {
		try {
			Test.createTestingModule({
				imports: [
					ConfigModule.forRoot({
						envFilePath: join(__dirname, '.env.fake'),
					}),
				],
			});
		} catch (e) {
			expect(e.message).toContain('Invalid option: expected one of "mysql"|"sqlite"');
		}
	});

	it('should be valid', () => {
		const module = Test.createTestingModule({
			imports: [ConfigModule.forRoot()],
		});

		expect(module).toBeDefined();
	});
});
