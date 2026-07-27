import {Category} from "@core/category/domain/category.aggregate";


export type CategoryOutput = {
	id: string;
	name: string;
	description: string | null;
	is_active: boolean;
	created_at: Date;
}

export class CategoryOutputMapper {
	static toOutput(entity: Category): CategoryOutput {
		const {category_id, ...otherProps} = entity.toJSON();
		return <CategoryOutput>{
			id: entity.category_id.id,
			...otherProps
		}
	}
}