import {Test} from '@nestjs/testing';
import {Sequelize} from 'sequelize-typescript';
import {getConnectionToken} from '@nestjs/sequelize';
import {ConfigService} from '@nestjs/config';
import {MigrationsModule} from '@/nest-modules/database/migrations.module';

describe('MigrationsModule Unit Tests', () => {
	test('should provide a database connection built from the env config', async () => {
		const module = await Test.createTestingModule({
			imports: [MigrationsModule]
		}).compile();

		// o ConfigModule vem de dentro do MigrationsModule (isGlobal)
		const configService = module.get(ConfigService);
		expect(configService.get('DB_VENDOR')).toBe('sqlite');

		const conn = module.get<Sequelize>(getConnectionToken());
		expect(conn).toBeDefined();
		expect(conn.options.dialect).toBe('sqlite');

		await conn.close();
	});
});
