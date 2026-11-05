import type { MigrationFn } from 'umzug';
import {DataTypes, Sequelize} from "sequelize";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";

type MigrationFnSequelize = MigrationFn<Sequelize>;

const TABLE_NAME = "audio_video_medias";

export const up: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize.getQueryInterface().createTable(TABLE_NAME, {
		audio_video_media_id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		raw_location: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		encoded_location: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		status: {
			type: DataTypes.ENUM(...Object.values(AudioVideoMediaStatus)),
			allowNull: false,
		},
		video_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		video_related_field: {
			type: DataTypes.STRING(20),
			allowNull: false,
		}
	});

	await sequelize.getQueryInterface().addConstraint(TABLE_NAME, {
		fields: ['video_id'],
		type: 'foreign key',
		name: 'audio_video_medias_video_id',
		references: {
			table: 'videos',
			field: 'video_id'
		},
		onDelete: 'RESTRICT',
		onUpdate: 'RESTRICT'
	});
};

export const down: MigrationFnSequelize = async ({context: sequelize}) => {
	await sequelize
		.getQueryInterface()
		.removeConstraint(TABLE_NAME, 'audio_video_medias_video_id');
	await sequelize.getQueryInterface().dropTable(TABLE_NAME);
};
