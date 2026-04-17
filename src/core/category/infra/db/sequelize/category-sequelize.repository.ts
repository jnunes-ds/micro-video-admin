import {ISearchableRepository} from "@core/@shared/domain/repository/repository_interface";
import {Category} from "@core/category/domain/category.entity";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {CategoryModelMapper} from "@core/category/infra/db/sequelize/category_model_mapper";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {CategorySearchParams, CategorySearchResult} from "@core/category/domain/category.repository";
import {Op, literal} from "sequelize";


export class CategorySequelizeRepository implements ISearchableRepository<Category, Uuid> {
	sortableFields: string[] = ['name', 'created_at'];

	constructor(private categoryModel: typeof CategoryModel) {}

	private formatSort(sort: string, sort_dir: string | null) {
		const dialect = this.categoryModel.sequelize?.getDialect();
		if (this.sortableFields.includes(sort)) {
			return dialect === 'mysql'
				? [[literal(`BINARY ${sort}`), sort_dir || 'asc']]
				: [[sort, sort_dir || 'asc']];
		}
		return [['created_at', 'desc']];
	}

	async insert(entity: Category): Promise<void> {
		const model = CategoryModelMapper.toModel(entity);
		await this.categoryModel.create(model.toJSON());
	}

	async bulkInsert(entities: Category[]): Promise<void> {
		const models = entities.map(CategoryModelMapper.toModel);
		const parsedModels = models.map(model => model.toJSON());
		await this.categoryModel.bulkCreate(parsedModels);
	}

	private async _get(id: string) {
		return await this.categoryModel.findByPk(id);
	}

	async update(entity: Category): Promise<void> {
		const id = entity.category_id.id
		const model = await this._get(id);

		if (!model) {
			throw new NotFoundError(id, this.getEntity())
		}

		const modelToUpdate = CategoryModelMapper.toModel(entity);

		await this.categoryModel.update(modelToUpdate.toJSON(), { where: { category_id: id } });
	}

	async delete(entity_id: Uuid): Promise<void> {
		const model = await this._get(entity_id.id);

		if (!model) {
			throw new NotFoundError(entity_id.id, this.getEntity())
		}

		await this.categoryModel.destroy({ where: { category_id: entity_id.id } });
	}

	async findById(entity_id: Uuid): Promise<Category | null> {
		const model = await this._get(entity_id.id);

		return model ? CategoryModelMapper.toEntity(model) : null;
	}

	async findAll(): Promise<Category[]> {
		const models = await this.categoryModel.findAll();
		return models.map(CategoryModelMapper.toEntity);
	}

	getEntity(): { new(...args: any[]): Category } {
		return Category;
	}

	async search(props: CategorySearchParams): Promise<CategorySearchResult> {
		const offset = (props.page - 1) * props.per_page;
		const limit = props.per_page;

		const {rows: models, count} = await this.categoryModel.findAndCountAll({
			...(props.filter && {
				where: {
					name: {
						[Op.like]: `%${props.filter}%`
					}
				}
			}),
			...(props.sort && this.sortableFields.includes(props.sort)
					? { order: this.formatSort(props.sort, props.sort_dir) }
					: { order: [['created_at', 'desc']] }),
			offset,
			limit
		});

		return new CategorySearchResult({
			items: models.map(CategoryModelMapper.toEntity),
			current_page: props.page,
			per_page: props.per_page,
			total: count
		});
	}

}