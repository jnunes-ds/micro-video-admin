import {BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {VideoModel} from "@core/video/infra/db/sequelize/video.models";
import {AudioVideoMediaStatus} from "@core/@shared/domain/value_objects/audio_video_media.vo";

export enum AudioVideoMediaRelatedField {
	TRAILER = 'trailer',
	VIDEO = 'video'
}

export type ImageMediaModelProps = {
	audio_video_media_id: string;
	name: string;
	raw_location: string;
	encoded_location: string | null;
	status: AudioVideoMediaStatus;
	video_id: string;
	video_related_field: AudioVideoMediaRelatedField;
};

@Table({
	tableName: 'audio_video_medias',
	timestamps: false,
	indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }]
})
export class AudioVideoMediaModel extends Model<ImageMediaModelProps> {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: () => new Uuid() })
	declare audio_video_media_id: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare raw_location: string;

	@Column({ type: DataType.STRING(255), allowNull: true })
	declare encoded_location: string | null;

	@Column({
		type: DataType.ENUM(
			AudioVideoMediaStatus.PROCESSING,
			AudioVideoMediaStatus.FAILED,
			AudioVideoMediaStatus.PENDING,
			AudioVideoMediaStatus.COMPLETED,
		)
	})
	declare status: AudioVideoMediaStatus;

	@ForeignKey(() => VideoModel)
	@Column({ type: DataType.UUID, allowNull: false })
	declare video_id: string;

	@BelongsTo(() => VideoModel)
	declare video: VideoModel;

	@Column({
		type: DataType.ENUM(
			AudioVideoMediaRelatedField.TRAILER,
			AudioVideoMediaRelatedField.VIDEO
		),
		allowNull: false
	})
	declare video_related_field: AudioVideoMediaRelatedField;
}