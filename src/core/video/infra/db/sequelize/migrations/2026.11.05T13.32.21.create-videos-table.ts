import type { MigrationFn } from 'umzug';
import {DataTypes, Sequelize} from "sequelize";
import {RatingValues} from "@core/video/domain/rating.vo";

type MigrationFnSequelize = MigrationFn<Sequelize>;

const TABLE_NAME = "videos";

export const up: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().createTable(TABLE_NAME, {
		video_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		year_launched: {
			type: DataTypes.SMALLINT,
			allowNull: false,
		},
		duration: {
			type: DataTypes.SMALLINT,
			allowNull: false,
		},
		rating: {
			type: DataTypes.ENUM(...Object.values(RatingValues)),
			allowNull: false,
		},
		is_opened: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		is_published: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE(6),
			allowNull: false,
		}
	});
};

export const down: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
