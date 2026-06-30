import type { MigrationFn } from 'umzug';
import {Sequelize} from "sequelize-typescript";
import {DataTypes} from "sequelize";

type SequelizeMigrationFN = MigrationFn<Sequelize>;

export const up: SequelizeMigrationFN = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().createTable('categories', {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		is_active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE(3),
			allowNull: false,
		},
	});
};
export const down: SequelizeMigrationFN = async ({context: seqyelize}) => {
	await seqyelize.getQueryInterface().dropTable('categories');
};
