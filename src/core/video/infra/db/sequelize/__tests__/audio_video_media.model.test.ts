import {DataType} from "sequelize-typescript";
import {setupSequelizeForVideo} from "@core/video/infra/db/sequelize/testing/helpers";
import {
	AudioVideoMediaModel,
	AudioVideoMediaRelatedField
} from "@core/video/infra/db/sequelize/audio_video_media.model";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";

describe("AudioVideoMediaModel Integration Tests", () => {
	setupSequelizeForVideo();

	test('table name', () => {
		expect(AudioVideoMediaModel.tableName).toBe('audio_video_medias');
	})

	test('mapping props', () => {
		const uniqueIndex = AudioVideoMediaModel.options.indexes![0];
		expect(uniqueIndex).toMatchObject({
			fields: ['video_id', 'video_related_field'],
			unique: true
		});

		const attributesMap = AudioVideoMediaModel.getAttributes();
		const attributes = Object.keys(AudioVideoMediaModel.getAttributes());
		expect(attributes).toStrictEqual([
			'audio_video_media_id',
			'name',
			'raw_location',
			'encoded_location',
			'status',
			'video_id',
			'video_related_field'
		]);

		const audioVideoMediaIdAttr = attributesMap.audio_video_media_id;
		expect(audioVideoMediaIdAttr).toMatchObject({
			field: 'audio_video_media_id',
			fieldName: 'audio_video_media_id',
			primaryKey: true,
			type: DataType.UUID(),
		});

		const nameAttr = attributesMap.name;
		expect(nameAttr).toMatchObject({
			field: 'name',
			fieldName: 'name',
			allowNull: false,
			type: DataType.STRING(255)
		});

		const rawLocationAttr = attributesMap.raw_location;
		expect(rawLocationAttr).toMatchObject({
			field: 'raw_location',
			fieldName: 'raw_location',
			allowNull: false,
			type: DataType.STRING(255)
		});

		const encodedLocationAttr = attributesMap.encoded_location;
		expect(encodedLocationAttr).toMatchObject({
			field: 'encoded_location',
			fieldName: 'encoded_location',
			allowNull: true,
			type: DataType.STRING(255)
		});

		const statusAttr = attributesMap.status;
		expect(statusAttr).toMatchObject({
			field: 'status',
			fieldName: 'status',
			allowNull: false,
			type: DataType.ENUM(
				AudioVideoMediaStatus.PROCESSING,
				AudioVideoMediaStatus.FAILED,
				AudioVideoMediaStatus.PENDING,
				AudioVideoMediaStatus.COMPLETED
			)
		});

		const videoIdAttr = attributesMap.video_id;
		expect(videoIdAttr).toMatchObject({
			field: 'video_id',
			fieldName: 'video_id',
			allowNull: false,
			type: DataType.UUID(),
			references: {
				key: 'video_id',
				model: 'videos',
			}
		});

		const videoRelatedFieldAttr = attributesMap.video_related_field;
		expect(videoRelatedFieldAttr).toMatchObject({
			field: 'video_related_field',
			fieldName: 'video_related_field',
			allowNull: false,
			type: DataType.ENUM(
				AudioVideoMediaRelatedField.TRAILER,
				AudioVideoMediaRelatedField.VIDEO,
			)
		});
	});
});