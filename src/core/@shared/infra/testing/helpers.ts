import {Sequelize, SequelizeOptions} from "sequelize-typescript";
import {Config} from "@core/@shared/infra/config";

export function setupSequelize(options: SequelizeOptions = {}) {
	let _sequelize: Sequelize;
	const force = true;

	beforeAll(async () => {
		_sequelize = new Sequelize({
			...Config.db(),
			...options,
		});
	});

	beforeEach(async () => await _sequelize.sync({force}));

	afterAll(async () => {
		await _sequelize.close();
	});

	return {
		get sequelize(): Sequelize {
			return _sequelize;
		}
	}
}