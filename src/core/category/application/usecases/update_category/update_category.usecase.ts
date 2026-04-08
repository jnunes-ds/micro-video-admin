import {IUseCase} from "@core/@shared/application/usecase.interface";
import {UpdateCategoryInput} from "@core/category/application/usecases/update_category/update_category.input";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {Uuid} from "@core/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {Category} from "@core/category/domain/category.entity";
import {CategoryOutput, CategoryOutputMapper} from "@core/category/application/usecases/common/category_output";


export class UpdateCategoryUsecase
	implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>{
	constructor(private categoryRepo: ICategoryRepository) {}

	async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
		const uuid = new Uuid(input.id);
		const category = await this.categoryRepo.findById(uuid);

		if (!category) {
			throw new NotFoundError(input.id, Category);
		}

		if (input.name) category.changeName(input.name);
		if (input.description) category.changeDescription(input.description);
		if (input.is_active) category.activate();
		if (input.is_active === false) category.deactivate();

		await this.categoryRepo.update(category);

		return CategoryOutputMapper.toOutput(category);
	}
}


export type UpdateCategoryOutput = CategoryOutput;