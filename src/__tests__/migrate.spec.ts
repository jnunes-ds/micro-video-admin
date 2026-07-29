import {NestFactory} from '@nestjs/core';
import {getConnectionToken} from '@nestjs/sequelize';
import {MigrationsModule} from '@/nest-modules/database/migrations.module';
import {migrator} from '@core/@shared/infra/db/sequelize/migrator';

jest.mock('@nestjs/core', () => ({
	...jest.requireActual('@nestjs/core'),
	NestFactory: {
		createApplicationContext: jest.fn()
	}
}));

// o swc reescreve o alias `@core/*` em tempo de transpilação, então o caminho do
// jest.mock precisa ser relativo para casar com o módulo resolvido
jest.mock('../core/@shared/infra/db/sequelize/migrator', () => ({
	migrator: jest.fn()
}));

describe('migrate script Unit Tests', () => {
	const runAsCLI = jest.fn();
	const sequelize = {fake: 'sequelize-connection'};
	const app = {get: jest.fn().mockReturnValue(sequelize)};

	beforeEach(() => {
		(NestFactory.createApplicationContext as jest.Mock).mockResolvedValue(app);
		(migrator as jest.Mock).mockReturnValue({runAsCLI});
		app.get.mockReturnValue(sequelize);
	});

	it('should bootstrap the migrations module and run the migrator as a cli', async () => {
		await import('@/migrate');
		// bootstrap() não é aguardado pelo módulo, então liberamos a fila de microtasks
		await new Promise((resolve) => setImmediate(resolve));

		expect(NestFactory.createApplicationContext).toHaveBeenCalledWith(MigrationsModule, {
			logger: ['error']
		});
		expect(app.get).toHaveBeenCalledWith(getConnectionToken());
		expect(migrator).toHaveBeenCalledWith(sequelize);
		expect(runAsCLI).toHaveBeenCalled();
	});
});
