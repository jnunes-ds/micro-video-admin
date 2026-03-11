import {IUseCase} from "@/@shared/application/usecase.interface";
import {ICategoryRepository} from "@/category/domain/category.repository";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";
import {CategoryOutput, CategoryOutputMapper} from "@/category/application/usecases/common/category_output";

export class UpdateCategoryUseCase
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

type UpdateCategoryInputBase = {
	id: string;
	name?: string;
	description?: string;
	is_active?: boolean;
}

export type UpdateCategoryInput = (
	| { name: string } & Omit<UpdateCategoryInputBase, 'name'>
	| { description: string } & Omit<UpdateCategoryInputBase, 'description'>
	| { is_active: boolean } & Omit<UpdateCategoryInputBase, 'is_active'>
)

export type UpdateCategoryOutput = CategoryOutput;