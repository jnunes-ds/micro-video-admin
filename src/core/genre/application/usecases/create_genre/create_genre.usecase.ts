import {IUnitOfWork} from "@core/@shared/domain/repository/unit_of_work.interface";
import {IGenreRepository} from "@core/genre/domain/genre.repository";
import {Genre} from "@core/genre/domain/genre.aggregate";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {GenreOutput, GenreOutputMapper} from "@core/genre/application/usecases/common/genre_output";
import {IUseCase} from "@core/@shared/application/usecase.interface";
import {CreateGenreInput} from "@core/genre/application/usecases/create_genre/create_genre.input";
import {ICategoryRepository} from "@core/category/domain/category.repository";
import {
    CategoriesIdsExistsInStorageValidator
} from "@core/category/application/validations/categories_ids_exists_in_storage.validator";
import {Notification} from "@core/@shared/domain/validators/notification";

export type CreateGenreOutput = GenreOutput;


export class CreateGenreUsecase implements IUseCase<
    CreateGenreInput,
    CreateGenreOutput
> {
    constructor(
        private uow: IUnitOfWork,
        private genreRepo: IGenreRepository,
        private categoryRepo: ICategoryRepository,
        private categoriesIdsExistsInStorage: CategoriesIdsExistsInStorageValidator
    ) {}

    async execute(input: CreateGenreInput): Promise<CreateGenreOutput> {
        const {name, is_active} = input;
        const [categoriesId, errorsCategoriesIds] = (await this.categoriesIdsExistsInStorage
            .validate(input.categories_id))
            .asArray();

        const entity = Genre.create({
            name,
            categories_id: errorsCategoriesIds ? [] : categoriesId,
            is_active,
        });

        const notification = new Notification();
        notification.copyErrors(entity.notification);

        if (errorsCategoriesIds) {
            notification.setError(
                errorsCategoriesIds.map(e => e.message),
                'categories_id'
            );
        }

        if (notification.hasErrors()) {
            throw new EntityValidationError(notification.toJSON());
        }

        await this.uow.do(async () => {
            return this.genreRepo.insert(entity);
        });

        const categories = await this.categoryRepo.findByIds(
            Array.from(entity.categories_id.values())
        );

        return GenreOutputMapper.toOutput(entity, categories);
    }
}