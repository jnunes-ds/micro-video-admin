import {Category, CastMemberId} from "@core/category/domain/category.aggregate";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";


export class CategoryModelMapper {
	static toModel(entity: Category): CategoryModel {
		return CategoryModel.build({
			category_id: entity.category_id.id,
			name: entity.name,
			description: entity.description,
			is_active: entity.is_active,
			created_at: entity.created_at,
		});
	}

	static toEntity(model: CategoryModel): Category {
		const category = new Category({
			category_id: new CastMemberId(model.category_id),
			name: model.name,
			description: model.description,
			is_active: model.is_active,
			created_at: model.created_at
		});
		category.validate();
		if (category.notification.hasErrors()) {
			throw new EntityValidationError(category.notification.toJSON());
		}
		return category;
	}
}