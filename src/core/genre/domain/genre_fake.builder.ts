
import Chance from "chance";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {CategoryId} from "@core/category/domain/category.aggregate";

type PropOrFactory<T> = T | ((index: number) => T);

export class GenreFakeBuilder<TBuild = any> {
	private _genre_id: PropOrFactory<GenreId> | undefined = undefined;
	private _name: PropOrFactory<string> = (_index) => this.chance.word();
	private _categories_id: PropOrFactory<CategoryId>[] = [];
	private _is_active: PropOrFactory<boolean> = (_index) => true;
	private _created_at: PropOrFactory<Date> | undefined = undefined;
	private countObjs;

	static aGenre() {
		return new GenreFakeBuilder<Genre>();
	}

	static theGenres(countObjs: number) {
		return new GenreFakeBuilder<Genre[]>(countObjs);
	}

	private chance: Chance.Chance;

	private constructor(countObj: number = 1) {
		this.countObjs = countObj;
		this.chance = Chance();
	}

	withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
		this._genre_id = valueOrFactory;
		return this;
	}

	withName(valueOrFactory: PropOrFactory<string>) {
		this._name = valueOrFactory;
		return this;
	}

	addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
		this._categories_id.push(valueOrFactory);
		return this;
	}

	withCategoriesId(...valuesOrFactories: PropOrFactory<CategoryId>[]) {
		this._categories_id = valuesOrFactories;
		return this;
	}

	activate() {
		this._is_active = true;
		return this;
	}

	deactivate() {
		this._is_active = false;
		return this;
	}

	withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
		this._created_at = valueOrFactory;
		return this;
	}

	withInvalidNameTooLong(value?: string) {
		this._name = value ?? this.chance.word({ length: 256 });
		return this;
	}

	build(): TBuild {
		const genres = new Array(this.countObjs)
			.fill(undefined)
			.map((_, index) => {
				const categoriesId = this._categories_id.length
					? this._categories_id.map((categoryId) =>
						this.callFactory(categoryId, index),
					)
					: [new CategoryId()];

				const genre = new Genre({
					gende_id: !this._genre_id
						? undefined
						: this.callFactory(this._genre_id, index),
					name: this.callFactory(this._name, index),
					categories_id: new Map(
						categoriesId.map((categoryId: CategoryId) => [
							categoryId.id,
							categoryId,
						]),
					),
					is_active: this.callFactory(this._is_active, index),
					...(this._created_at && {
						created_at: this.callFactory(this._created_at, index),
					}),
				});
				return genre;
			});
		// @ts-ignore
		return this.countObjs === 1 ? (genres[0] as any) : genres;
	}

	get genre_id() {
		return this.getValue('genre_id');
	}

	get name() {
		return this.getValue('name');
	}

	get categories_id(): CategoryId[] {
		if (!this._categories_id.length) {
			throw new Error(
				`Property categories_id not have a factory, use 'with' methods`,
			);
		}
		return this._categories_id.map((categoryId) =>
			this.callFactory(categoryId, 0),
		);
	}

	get is_active() {
		return this.getValue('is_active');
	}

	get created_at() {
		return this.getValue('created_at');
	}

	private getValue(prop: any) {
		const optional = ['genre_id', 'created_at'];
		const privateProp = `_${prop}` as keyof this;
		if (!this[privateProp] && optional.includes(prop)) {
			throw new Error(
				`Property ${prop} not have a factory, use 'with' methods`,
			);
		}
		return this.callFactory(this[privateProp], 0);
	}

	private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
		return typeof factoryOrValue === 'function'
			? factoryOrValue(index)
			: factoryOrValue;
	}
}
