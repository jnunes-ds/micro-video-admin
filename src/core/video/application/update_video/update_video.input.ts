import {RatingValues} from "@core/video/domain/rating.vo";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	validateSync
} from "class-validator";

export type UpdateVideoInputConstructorProps = {
	id: string;
	title?: string;
	description?: string;
	year_launched?: number;
	duration?: number;
	rating?: RatingValues;
	is_opened?: boolean;
	categories_id?: string[];
	genres_id?: string[];
	cast_members_id?: string[];
}

export class UpdateVideoInput {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsOptional()
	title?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@Min(1900)
	@IsInt()
	@IsOptional()
	year_launched?: number;

	@Min(1)
	@IsInt()
	@IsOptional()
	duration?: number;

	@IsEnum(RatingValues)
	@IsOptional()
	rating?: RatingValues;

	@IsBoolean()
	@IsOptional()
	is_opened?: boolean;

	@IsUUID('4', { each: true })
	@IsArray()
	@IsOptional()
	categories_id?: string[];

	@IsUUID('4', { each: true })
	@IsArray()
	@IsOptional()
	genres_id?: string[];

	@IsUUID('4', { each: true })
	@IsArray()
	@IsOptional()
	cast_members_id?: string[];

	constructor(props?: UpdateVideoInputConstructorProps) {
		if (!props) return;
		this.id = props.id;
		props.title && (this.title = props.title)
		props.description && (this.description = props.description)
		props.year_launched && (this.year_launched = props.year_launched)
		props.duration && (this.duration = props.duration)
		props.rating && (this.rating = props.rating)
		props.is_opened !== null && (this.is_opened = props.is_opened)
		props.categories_id &&
		props.categories_id.length && (this.categories_id = props.categories_id)
		props.genres_id &&
		props.genres_id.length && (this.genres_id = props.genres_id)
		props.cast_members_id &&
		props.cast_members_id.length && (this.cast_members_id = props.cast_members_id)
	}
}

export class ValidateUpdateVideoInput {
	static validate(input: UpdateVideoInput) {
		return validateSync(input);
	}
}