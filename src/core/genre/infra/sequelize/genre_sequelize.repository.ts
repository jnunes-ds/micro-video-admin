import {Op} from "sequelize";
import {GenreFilter, GenreSearchParams, IGenreRepository} from "@core/genre/domain/genre.repository";
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {GenreModelMapper} from "@core/genre/infra/sequelize/genre.model.mapper";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {SearchResult} from "@core/@shared/domain/repository/search_result";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";

export class GenreSequelizeRepository implements IGenreRepository {
	sortableFields: string [] = [ 'name', 'created_at'];
	orderBy = {
		mysql: {
			name: (sort_dir: SortDirection) => `binary ${this.genreModel.name}.name ${sort_dir}`
		}
	};

	constructor(
		private genreModel: typeof GenreModel,
		private uow: UnitOfWorkSequelize
	) {}

	async insert(entity: Genre): Promise<void> {
		await this.genreModel.create(GenreModelMapper.toModelProps(entity), {
			include: ['categories_id'],
			transaction: this.uow.getTransaction()
		});
	}

	async bulkInsert(entities: Genre[]): Promise<void> {
		const models = entities.map(e => GenreModelMapper.toModelProps(e));
		await this.genreModel.bulkCreate(models, {
			include: ['categories_id'],
			transaction: this.uow.getTransaction()
		});
	}

	async findById(entity_id: GenreId): Promise<Genre | null> {
		const model = await this._get(entity_id.id);
		return model ? GenreModelMapper.toEntity(model) : null;
	}

	async findAll(): Promise<Genre[]> {
		const models = await this.genreModel.findAll({
			include: ['categories_id'],
			transaction: this.uow.getTransaction()
		});
		return models.map((model) => GenreModelMapper.toEntity(model));
	}

	async findByIds(ids: GenreId[]): Promise<Genre[]> {
		const models = await this.genreModel.findAll({
			where: {
				genre_id: {
					[Op.in]: ids.map((id) => id.id),
				},
			},
			include: ['categories_id'],
			transaction: this.uow.getTransaction()
		});
		return models.map((m) => GenreModelMapper.toEntity(m));
	}

	async existsById(
		ids: GenreId[],
	): Promise<{ exists: GenreId[]; not_exists: GenreId[] }> {
		if (!ids.length) {
			throw new Error(
				'ids must be an array with at least one element',
			);
		}

		const existsGenreModels = await this.genreModel.findAll({
			attributes: ['genre_id'],
			transaction: this.uow.getTransaction(),
			where: {
				genre_id: {
					[Op.in]: ids.map((id) => id.id),
				},
			},
		});
		const existsGenreIds = existsGenreModels.map(
			(m) => new GenreId(m.genre_id),
		);
		const notExistsGenreIds = ids.filter(
			(id) => !existsGenreIds.some((e) => e.equals(id)),
		);
		return {
			exists: existsGenreIds,
			not_exists: notExistsGenreIds,
		};
	}


	async update(aggregate: Genre): Promise<void> {
		const id = aggregate.gende_id.id;

		const model = await this._get(id);

		if (!model) {
			throw new NotFoundError(id, this.getEntity());
		}

		await model.$remove(
			'categories',
			model.categories_id.map(c => c.category_id)
		);

		const {categories_id, ...props} = GenreModelMapper.toModelProps(aggregate);

		await this.genreModel.update(props, {
			transaction: this.uow.getTransaction(),
			where: {
				genre_id: aggregate.gende_id.id
			}
		});

		await model.$add(
			'categories',
			categories_id.map(c => c.category_id)
		);
	}

	async delete(entity_id: GenreId): Promise<void> {
		const id = entity_id.id;

		const genreCategoryRelation =
			this.genreModel.associations.categories_id.target;

		await genreCategoryRelation.destroy({where: {genre_id: id}});

		const affectedRows = await this.genreModel.destroy({
			transaction: this.uow.getTransaction(),
			where: {genre_id: id}
		});

		if (affectedRows !== 1) {
			throw new NotFoundError(id, this.getEntity());
		}
	}

	private _get(id: string): Promise<GenreModel | null> {
		return this.genreModel.findByPk(id, {
			include: ['categories_id'],
			transaction: this.uow.getTransaction()
		});
	}

	async search(props: GenreSearchParams): Promise<SearchResult<Genre>> {
		const offset = (props.page - 1) * props.per_page;
		const limit = props.per_page;

		const where: any = {};

		if (props.filter?.name) {
			where.name = {[Op.like]: `%${props.filter.name}%`};
		}

		if (props.filter?.categories_id?.length) {
			const genreIds = await this._filterGenreIdsByCategoriesId(props.filter.categories_id);

			if (!genreIds.length) {
				return new SearchResult({
					items: [],
					current_page: props.page,
					per_page: props.per_page,
					total: 0
				});
			}

			where.genre_id = {[Op.in]: genreIds};
		}

		const {rows: models, count} = await this.genreModel.findAndCountAll({
			...(Object.keys(where).length && {where}),
			...(props.sort && this.sortableFields.includes(props.sort)
				? {order: this.formatSort(props.sort, props.sort_dir!)}
				: {order: [['created_at', 'desc']]}),
			include: ['categories_id'],
			transaction: this.uow.getTransaction(),
			distinct: true,
			offset,
			limit
		});

		return new SearchResult({
			items: models.map((model) => GenreModelMapper.toEntity(model)),
			current_page: props.page,
			per_page: props.per_page,
			total: count
		});
	}

	private async _filterGenreIdsByCategoriesId(categories_id: GenreFilter['categories_id']): Promise<string[]> {
		const genreCategoryModels = await GenreCategoryModel.findAll({
			attributes: ['genre_id'],
			where: {
				category_id: {
					[Op.in]: categories_id!.map((category_id) => category_id.id)
				}
			}
		});

		return [...new Set(genreCategoryModels.map((model) => model.genre_id))];
	}

	private formatSort(sort: string, sort_dir: SortDirection) {
		const dialect = this.genreModel.sequelize!.getDialect() as 'mysql';
		if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
			return this.orderBy[dialect][sort](sort_dir);
		}
		return [[sort, sort_dir]];
	}

	getEntity(): new (...args: any[]) => Genre {
		return Genre;
	}
}