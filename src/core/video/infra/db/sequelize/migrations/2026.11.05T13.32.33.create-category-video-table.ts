import type { MigrationFn } from 'umzug';
import {DataTypes, Sequelize} from "sequelize";

type MigrationFnSequelize = MigrationFn<Sequelize>;

const TABLE_NAME = "category_video";

export const up: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().createTable(TABLE_NAME, {
		video_id: {
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
		fields: ['video_id'],
		type: 'foreign key',
		name: 'category_video_video_id',
		references: {
			table: 'videos',
			field: 'video_id'
		},
		onDelete: 'RESTRICT',
		onUpdate: 'RESTRICT',
	});
	await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
		fields: ['category_id'],
		type: 'foreign key',
		name: 'category_video_category_id',
		references: {
			table: 'categories',
			field: 'category_id'
		},
		onDelete: 'RESTRICT',
		onUpdate: 'RESTRICT',
	});
};

export const down: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().removeConstraint(TABLE_NAME, 'category_video_video_id');
	await sequelize.getQueryInterface().removeConstraint(TABLE_NAME, 'category_video_category_id');
	await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
