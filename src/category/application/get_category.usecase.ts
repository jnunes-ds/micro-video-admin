import {IUseCase} from "@/@shared/application/usecase.interface";
import {ICategoryRepository} from "@/category/domain/category.repository";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";
import {NotFoundError} from "@/@shared/domain/errors/not_found.error";
import {Category} from "@/category/domain/category.entity";

export class GetCategoryUsecase
	implements IUseCase<GetCategoryInput, GetCategoryOutput> {
	constructor(private readonly repository: ICategoryRepository) {}

	async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
		const category = await this.repository.findById(new Uuid(input.id));

		if (!category) {
			throw new NotFoundError(input.id, Category);
		}

		return {
			id: category.category_id.id,
			name: category.name,
			description: category.description,
			is_active: category.is_active,
			created_at: category.created_at,
		};
	}
}

export type GetCategoryInput = {
	id: string;
};

export type GetCategoryOutput = {
	id: string;
	name: string;
	description: string | null;
	is_active: boolean;
	created_at: Date;
};