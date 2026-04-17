import { Op, literal } from 'sequelize';
import {
	CategorySearchParams,
	CategorySearchResult,
	ICategoryRepository,
} from '@/core/category/domain/category.repository';
import { CategoryModel } from './category.model';
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import {Category} from "@core/category/domain/category.entity";
import {CategoryModelMapper} from "@core/category/infra/db/sequelize/category_model_mapper";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";

export class CategorySequelizeRepository implements ICategoryRepository {
	sortableFields: string[] = ['name', 'created_at'];
	orderBy = {
		mysql: {
			name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`), //ascii
		},
	};

	constructor(private categoryModel: typeof CategoryModel) {}

	async insert(entity: Category): Promise<void> {
		const modelProps = CategoryModelMapper.toModel(entity);
		await this.categoryModel.create(modelProps.toJSON());
	}

	async bulkInsert(entities: Category[]): Promise<void> {
		const modelsProps = entities.map((entity) =>
			CategoryModelMapper.toModel(entity).toJSON(),
		);
		await this.categoryModel.bulkCreate(modelsProps);
	}

	async update(entity: Category): Promise<void> {
		const id = entity.category_id.id;

		const modelProps = CategoryModelMapper.toModel(entity);
		const [affectedRows] = await this.categoryModel.update(
			modelProps.toJSON(),
			{
				where: { category_id: entity.category_id.id },
			},
		);

		if (affectedRows !== 1) {
			throw new NotFoundError(id, this.getEntity());
		}
	}

	async delete(category_id: Uuid): Promise<void> {
		const id = category_id.id;

		const affectedRows = await this.categoryModel.destroy({
			where: { category_id: id },
		});

		if (affectedRows !== 1) {
			throw new NotFoundError(id, this.getEntity());
		}
	}

	async findByIds(ids: Uuid[]): Promise<Category[]> {
		const models = await this.categoryModel.findAll({
			where: {
				category_id: {
					[Op.in]: ids.map((id) => id.id),
				},
			},
		});
		return models.map((m) => CategoryModelMapper.toEntity(m));
	}

	async existsById(
		ids: Uuid[],
	): Promise<{ exists: Uuid[]; not_exists: Uuid[] }> {
		if (!ids.length) {
			throw new Error(
				'ids must be an array with at least one element',
			);
		}

		const existsCategoryModels = await this.categoryModel.findAll({
			attributes: ['category_id'],
			where: {
				category_id: {
					[Op.in]: ids.map((id) => id.id),
				},
			},
		});
		const existsCategoryIds = existsCategoryModels.map(
			(m) => new Uuid(m.category_id),
		);
		const notExistsCategoryIds = ids.filter(
			(id) => !existsCategoryIds.some((e) => e.equals(id)),
		);
		return {
			exists: existsCategoryIds,
			not_exists: notExistsCategoryIds,
		};
	}

	async findById(entity_id: Uuid): Promise<Category | null> {
		const model = await this.categoryModel.findByPk(entity_id.id);

		return model ? CategoryModelMapper.toEntity(model) : null;
	}

	async findAll(): Promise<Category[]> {
		const models = await this.categoryModel.findAll();
		return models.map((model) => {
			return CategoryModelMapper.toEntity(model);
		});
	}

	async search(props: CategorySearchParams): Promise<CategorySearchResult> {
		const offset = (props.page - 1) * props.per_page;
		const limit = props.per_page;
		const { rows: models, count } = await this.categoryModel.findAndCountAll({
			...(props.filter && {
				where: {
					name: { [Op.like]: `%${props.filter}%` },
				},
			}),
			...(props.sort && this.sortableFields.includes(props.sort)
				? { order: this.formatSort(props.sort, props.sort_dir!) }
				: { order: [['created_at', 'desc']] }),
			offset,
			limit,
		});
		return new CategorySearchResult({
			items: models.map((model) => {
				return CategoryModelMapper.toEntity(model);
			}),
			current_page: props.page,
			per_page: props.per_page,
			total: count,
		});
	}

	private formatSort(sort: string, sort_dir: SortDirection) {
		const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
		if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
			return this.orderBy[dialect][sort](sort_dir);
		}
		return [[sort, sort_dir]];
	}

	getEntity(): new (...args: any[]) => Category {
		return Category;
	}
}
