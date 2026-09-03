import {RatingValues} from "@core/video/domain/rating.vo";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table} from "sequelize-typescript";

export type VideoModelsProps = {
	vide_id: string;
	title: string;
	description: string;
	year_launched: number;
	duration: number;
	rating: RatingValues;
	is_opened: boolean;
	is_published: boolean;

	categories_id: VideoCategoryModel[];
	categories: CategoryModel[];
	genres_id: VideoGenreModel[];
	genres: GenreModel[];
	cast_members_id: VideoCastMemberModel[];
	cast_members: CastMemberModel[];
	created_at: Date;
};

@Table({ tableName: 'videos', timestamps: false })
export class VideoModel extends Model<VideoModelsProps> {
	@PrimaryKey
	@Column({ type: DataType.UUID })
	declare video_id: string;

	@Column({ type: DataType.STRING(255), allowNull: false })
	declare title: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare description: string;

	@Column({ type: DataType.SMALLINT, allowNull: false })
	declare year_launched: number;

	@Column({ type: DataType.SMALLINT, allowNull: false })
	declare duration: number;

	@Column({
		type: DataType.ENUM(
			RatingValues.RL,
			RatingValues.R10,
			RatingValues.R12,
			RatingValues.R14,
			RatingValues.R16,
			RatingValues.R18
		),
		allowNull: false
	})
	declare rating: RatingValues;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	declare is_open: boolean;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	declare is_published: boolean;

	@HasMany(() => VideoCategoryModel, 'video_id')
	declare categorories_id: VideoCategoryModel[];

	@BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
	declare categories: CategoryModel[];

	@HasMany(() => VideoGenreModel, 'video_id')
	declare genres_id: VideoGenreModel[];

	@BelongsToMany(() => GenreModel, () => VideoGenreModel)
	declare genres: GenreModel[];

	@HasMany(() => VideoCastMemberModel, 'video_id')
	declare cast_members_id: VideoCastMemberModel[];

	@BelongsToMany(() => CategoryModel, () => VideoCastMemberModel)
	declare cast_members: CastMemberModel[];

	@Column({ type: DataType.DATE(6), allowNull: false })
	declare created_at: Date;
}

export type VideoCategoryModelProps = {
	video_id: string;
	category_id: string;
};

@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
	@PrimaryKey
	@ForeignKey(() => VideoModel)
	@Column({ type: DataType.UUID })
	declare video_id: string;

	@PrimaryKey
	@ForeignKey(() => CategoryModel)
	@Column({ type: DataType.UUID })
	declare category_id: string;
}

export type VideoGenreModelProps = {
	video_id: string;
	genre_id: string;
};

@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
	@PrimaryKey
	@ForeignKey(() => VideoModel)
	@Column({ type: DataType.UUID })
	declare video_id: string;

	@PrimaryKey
	@ForeignKey(() => GenreModel)
	@Column({ type: DataType.UUID })
	declare genre_id: string;
}

export type VideoCastMemberModelProps = {
	video_id: string;
	cast_member_id: string;
};

@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
	@PrimaryKey
	@ForeignKey(() => VideoModel)
	@Column({ type: DataType.UUID })
	declare video_id: string;

	@PrimaryKey
	@ForeignKey(() => CastMemberModel)
	@Column({ type: DataType.UUID })
	declare cast_member_id: string;
}