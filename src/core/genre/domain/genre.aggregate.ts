import {AggregateRoot} from "@core/@shared/domain/aggregate_root";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {GenreValidatorFactory} from "@core/genre/domain/genre.validator";
import {GenreFakeBuilder} from "@core/genre/domain/genre_fake.builder";
import {EntityId} from "@core/@shared/domain/entity";

export type GenreConstructorProps = {
	genre_id?: GenreId;
	name: string;
	categories_id: Map<string, CategoryId>;
	is_active?: boolean;
	created_at?: Date;
}

export type GenreCreateCommand = {
	name: string;
	categories_id: CategoryId[];
	is_active?: boolean;
}

export class GenreId extends EntityId {}

export class Genre extends AggregateRoot {
	genre_id: GenreId;
	name: string;
	categories_id: Map<string, CategoryId>;
	is_active: boolean;
	created_at: Date;

	constructor(props: GenreConstructorProps) {
		super();
		this.genre_id = props.genre_id ?? new GenreId();
		this.name = props.name;
		this.categories_id = props.categories_id;
		this.is_active = props.is_active ?? true;
		this.created_at = props.created_at ?? new Date();
	}

	public static create(props: GenreCreateCommand): Genre {
		const genre = new Genre({
			...props,
			categories_id: new Map(
				props.categories_id.map((category_id) => [category_id.id, category_id])
			)
		});
		genre.validate();
		return genre;
	}

	public changeName(name: string) {
		this.name = name;
	}

	public addCategoryId(category_id: CategoryId) {
		this.categories_id.set(category_id.id, category_id);
	}

	public removeCategoryId(category_id: CategoryId) {
		this.categories_id.delete(category_id.id);
	}

	public syncCategoriesId(categories_id: CategoryId[]) {
		if (!categories_id) {
			throw new Error('Categories id is empty')
		}
		this.categories_id = new Map(
			categories_id.map((category_id) => [category_id.id, category_id])
		);
	}

	public activate() {
		this.is_active = true;
	}

	public deactivate() {
		this.is_active = false;
	}

	get entity_id(): GenreId {
		return this.genre_id;
	}

	public toJSON() {
		return {
			genre_id: this.genre_id.id,
			name: this.name,
			categories_id: this.categories_id_from_map_to_array(this.categories_id),
			is_active: this.is_active,
			created_at: this.created_at
		}
	}

	public validate() {
		const validator = GenreValidatorFactory.create();
		return validator.validate(this.notification, this);

	}

	public static fake() {
		return GenreFakeBuilder;
	}

	private categories_id_from_map_to_array(categoriesId: Map<string, CategoryId>): string[] {
		return Array.from(categoriesId.values()).map((category_id) => category_id.id);

	}
}