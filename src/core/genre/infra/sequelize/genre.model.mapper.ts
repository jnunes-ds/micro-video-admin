import {Genre, GenreId} from "@core/genre/domain/genre.aggregate";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CategoryId} from "@core/category/domain/category.aggregate";
import {Notification} from "@core/@shared/domain/validators/notification";

export class GenreModelMapper {
	public static toEntity(model: GenreModel): Genre {
		const {genre_id: id, categories_id = [], ...rest} = model.toJSON();

		const categoriesId = categories_id.map(
			c => new CategoryId(c.category_id),
		);

		const notification = new Notification();
		if (!categoriesId.length) {
			notification.addError(
				'categories_id should not be empty',
				'categories_id'
			);
		}

		const genre = new Genre({
			...rest,
			gende_id: new GenreId(id),
			categories_id: new Map(categoriesId.map(c => [c.id, c])),
		});

		genre.validate();

		notification.copyErrors(genre.notification);

		if (notification.hasErrors()) {
			throw new Error(notification.toString());
		}

		return genre;
	}

	public static toModelProps(aggregate: Genre) {
		const {categories_id, ...rest} = aggregate.toJSON();
		return {
			...rest,
			categories_id: categories_id.map(
				category_id => new GenreCategoryModel({
					genre_id: aggregate.gende_id.id,
					category_id
				})
			)
		}
	}
}