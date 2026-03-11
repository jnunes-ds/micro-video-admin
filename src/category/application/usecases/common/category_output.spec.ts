import {Category} from "@/category/domain/category.entity";
import {CategoryOutputMapper} from "@/category/application/usecases/common/category_output";

describe('CategoryOutputMapper Unit Tests', () => {
	it('should convert a category in output', () => {
		const entity = Category.fake()
			.aCategory()
			.withName('Movie')
			.withDescription('some description')
			.build();

		const spyToJSON = jest.spyOn(entity, 'toJSON');
		const output = CategoryOutputMapper.toOutput(entity);
		expect(spyToJSON).toHaveBeenCalled();
		expect(output).toStrictEqual({
			id: entity.category_id.id,
			name: entity.name,
			description: entity.description,
			is_active: entity.is_active,
			created_at: entity.created_at,
		});
	});
});