import type { MigrationFn } from 'umzug';
import {Sequelize, DataTypes} from 'sequelize';

type SequelizeMigrationFN = MigrationFn<Sequelize>;

const TABLE_NAME = "category_genre";

export const up: SequelizeMigrationFN = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().createTable(TABLE_NAME, {
		genre_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		category_id: {
				type: DataTypes.UUID,
				allowNull: false,
				primaryKey: true,
		}
	});
	await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
		fields: ['genre_id'],
		type: 'foreign key',
		name: 'category_genre_genre_id',
		references: {
			table: 'genres',
			field: 'genre_id'
		},
		onDelete: 'RESTRICT',
		onUpdate: 'RESTRICT'
	});
	await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
		fields: ['category_id'],
		type: 'foreign key',
		name: 'category_genre_category_id',
		references: {
			table: 'categories',
			field: 'category_id'
		},
		onDelete: 'RESTRICT',
		onUpdate: 'RESTRICT'
	});
};

export const down: SequelizeMigrationFN = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().removeConstraint(TABLE_NAME, 'category_genre_genre_id');
	await sequelize.getQueryInterface().removeConstraint(TABLE_NAME, 'category_genre_category_id');
	await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
