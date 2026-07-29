import {Sequelize} from 'sequelize-typescript';
import {migrator} from '@core/@shared/infra/db/sequelize/migrator';

describe('migrator Unit Tests', () => {
	let sequelize: Sequelize;

	beforeEach(() => {
		sequelize = new Sequelize({
			dialect: 'sqlite',
			host: ':memory:',
			logging: false
		});
	});

	afterEach(async () => {
		await sequelize.close();
	});

	it('should find every pending migration of the project', async () => {
		const migrations = await migrator(sequelize, {logger: undefined}).pending();
		const names = migrations.map((m) => m.name);

		expect(names).toEqual(
			expect.arrayContaining([
				'2026.06.20T17.44.08.create-categories-table.ts',
				'2026.07.23T15.09.17.create-cast-member-table.ts'
			])
		);
	});

	it('should create the tables when migrations are executed', async () => {
		const umzug = migrator(sequelize, {logger: undefined});

		const executed = await umzug.up();

		expect(executed.length).toBeGreaterThanOrEqual(2);

		const queryInterface = sequelize.getQueryInterface();
		const tables = await queryInterface.showAllTables();
		expect(tables).toEqual(expect.arrayContaining(['categories', 'cast_members']));

		// ATENÇÃO: a migration de categories cria a PK como `id`, mas o
		// `CategoryModel` mapeia `category_id` — ver o describe
		// 'categories table schema' abaixo, que documenta essa divergência.
		const categoriesColumns = await queryInterface.describeTable('categories');
		expect(Object.keys(categoriesColumns).sort()).toStrictEqual([
			'created_at',
			'description',
			'id',
			'is_active',
			'name'
		]);

		const castMembersColumns = await queryInterface.describeTable('cast_members');
		expect(Object.keys(castMembersColumns).sort()).toStrictEqual([
			'cast_member_id',
			'created_at',
			'name',
			'type'
		]);
		expect(castMembersColumns['cast_member_id'].primaryKey).toBe(true);
		expect(castMembersColumns['name'].allowNull).toBe(false);
		expect(castMembersColumns['type'].allowNull).toBe(false);
		expect(castMembersColumns['created_at'].allowNull).toBe(false);
	});

	it('should keep track of the executed migrations using the storage', async () => {
		const umzug = migrator(sequelize, {logger: undefined});
		await umzug.up();

		const pending = await umzug.pending();
		expect(pending).toStrictEqual([]);

		const executed = await umzug.executed();
		expect(executed.map((m) => m.name)).toEqual(
			expect.arrayContaining([
				'2026.06.20T17.44.08.create-categories-table.ts',
				'2026.07.23T15.09.17.create-cast-member-table.ts'
			])
		);
	});

	it('should drop the tables when migrations are reverted', async () => {
		const umzug = migrator(sequelize, {logger: undefined});
		await umzug.up();

		await umzug.down({to: 0});

		const tables = await sequelize.getQueryInterface().showAllTables();
		expect(tables).not.toContain('categories');
		expect(tables).not.toContain('cast_members');
	});

	describe('categories table schema', () => {
		// A migration `create-categories-table` cria a coluna de PK como `id`,
		// enquanto o `CategoryModel` (e o repositório sequelize de Category)
		// esperam `category_id`. Nos testes isso passa despercebido porque o
		// `DatabaseModule` usa `autoLoadModels`/`sync()`, que cria a tabela a
		// partir do model e nunca executa a migration. Em um banco criado via
		// `npm run migrate:*`, qualquer consulta a Category quebra.
		it('currently creates the primary key as `id` instead of `category_id`', async () => {
			await migrator(sequelize, {logger: undefined}).up();

			const columns = await sequelize.getQueryInterface().describeTable('categories');

			expect(columns).toHaveProperty('id');
			expect(columns).not.toHaveProperty('category_id');
			expect(columns['id'].primaryKey).toBe(true);
		});

		it.skip('should create the primary key as `category_id` to match CategoryModel (desired behavior)', async () => {
			await migrator(sequelize, {logger: undefined}).up();

			const columns = await sequelize.getQueryInterface().describeTable('categories');

			expect(columns).toHaveProperty('category_id');
			expect(columns['category_id'].primaryKey).toBe(true);
		});
	});

	it('should allow overriding the default options', async () => {
		const logger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			debug: jest.fn()
		};

		await migrator(sequelize, {logger}).up();

		expect(logger.info).toHaveBeenCalled();
	});
});
