import {Column, DataType, ForeignKey, Model, PrimaryKey, Table} from 'sequelize-typescript';
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {VideoModel} from "@core/video/infra/db/sequelize/video.models";

export enum ImageMegiaRelatedField {
	BANNER = 'banner',
	THUMBNAIL = 'thumbnail',
	THUMBNAIL_HALF = 'thumbnail_half'
}

export type ImageMediaModelProps = {
	image_media_id: string;
	name: string;
	location: string;
	video_id: string;
	video_related_field: ImageMegiaRelatedField;
};

@Table({
	tableName: 'image_medias',
	timestamps: false,
	indexes: [{ fields: ['video_id', 'video_related_field'], unique: true }]
})
export class ImageMediaModel extends Model<ImageMediaModelProps> {
	@PrimaryKey
	@Column({ type: DataType.UUID, defaultValue: () => new Uuid() })
	declare image_media_id: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare location: string;

	@ForeignKey(() => VideoModel)
	@Column({ type: DataType.UUID, allowNull: false })
	declare video_id: string;

	@Column({
		type: DataType.ENUM(
			ImageMegiaRelatedField.BANNER,
			ImageMegiaRelatedField.THUMBNAIL,
			ImageMegiaRelatedField.THUMBNAIL_HALF
		),
		allowNull: false
	})
	declare video_related_field: ImageMegiaRelatedField;
}