import { CreateGenreUsecase } from "../create_genre.usecase";
import { Sequelize } from "sequelize-typescript";
import {UnitOfWorkSequelize} from "@core/@shared/infra/db/sequelize/unit_of_work_sequelize";
import {GenreSequelizeRepository} from "@core/genre/infra/sequelize/genre_sequelize.repository";
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {
    CategoriesIdsExistsInStorageValidator
} from "@core/category/application/validations/categories_ids_exists_in_storage.validator";
import {GenreCategoryModel, GenreModel} from "@core/genre/infra/sequelize/genre.model";
import {CategoryModel} from "@core/category/infra/db/sequelize/category.model";
import {EntityValidationError} from "@core/@shared/domain/validators/validation.error";
import {Category} from "@core/category/domain/category.aggregate";
import {GenreId} from "@core/genre/domain/genre.aggregate";

describe("CreateGenreUsecase Integration Tests", () => {
    let usecase: CreateGenreUsecase;
    let uow: UnitOfWorkSequelize;
    let genreRepo: GenreSequelizeRepository;
    let categoryRepo: CategorySequelizeRepository;
    let categoriesIdsValidator: CategoriesIdsExistsInStorageValidator;
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            models: [GenreModel, GenreCategoryModel, CategoryModel],
        });
        await sequelize.sync({ force: true });

        uow = new UnitOfWorkSequelize(sequelize);
        genreRepo = new GenreSequelizeRepository(GenreModel, uow);
        categoryRepo = new CategorySequelizeRepository(CategoryModel);
        categoriesIdsValidator = new CategoriesIdsExistsInStorageValidator(categoryRepo);
        usecase = new CreateGenreUsecase(uow, genreRepo, categoryRepo, categoriesIdsValidator);
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should throw an entity validation error when categories id not exists", async () => {
        expect.assertions(3);
        const spyValidateCategoriesId = jest.spyOn(categoriesIdsValidator, "validate");
        const categoriesId = [
            "f47ac10b-58cc-4372-a567-0e02b2c3d479",
            "98b526f7-a92f-4e89-ad4b-37c52a7e4b6c",
        ];

        try {
            await usecase.execute({
                name: "test",
                categories_id: categoriesId,
            });
        } catch (e) {
            expect(spyValidateCategoriesId).toHaveBeenCalledWith(categoriesId);
            expect(e).toBeInstanceOf(EntityValidationError);
            expect(e.error).toEqual([
                {
                    categories_id: [
                        "Category Not found using ID f47ac10b-58cc-4372-a567-0e02b2c3d479",
                        "Category Not found using ID 98b526f7-a92f-4e89-ad4b-37c52a7e4b6c",
                    ],
                },
            ]);
        }
    });

    it("should create a genre", async () => {
        const category1 = Category.create({ name: "c1" });
        const category2 = Category.create({ name: "c2" });
        await categoryRepo.bulkInsert([category1, category2]);

        const output = await usecase.execute({
            name: "test",
            categories_id: [category1.category_id.id, category2.category_id.id],
        });

        const genreId = new GenreId(output.id);
        const genre = await genreRepo.findById(genreId);
        expect(genre).toBeDefined();
        expect(genre!.name).toBe("test");
        expect(genre!.categories_id.size).toBe(2);
        expect(output.name).toBe("test");
        expect(output.categories).toHaveLength(2);
    });

    it('should rollback transaction', async () => {
        const category1 = Category.create({ name: "c1" });
        const category2 = Category.create({ name: "c2" });
        await categoryRepo.bulkInsert([category1, category2]);

        const spyInsert = jest.spyOn(genreRepo, 'insert').mockImplementation(() => {
            throw new Error('Simulated error during insert');
        });

        const input = {
            name: "test",
            categories_id: [category1.category_id.id, category2.category_id.id],
        };

        await expect(usecase.execute(input)).rejects.toThrow('Simulated error during insert');

        expect(spyInsert).toHaveBeenCalledTimes(1);
        const genres = await genreRepo.findAll();
        expect(genres).toHaveLength(0);

        const categories = await categoryRepo.findAll();
        expect(categories).toHaveLength(2);
        expect(categories[0].name).toBe('c1');
        expect(categories[1].name).toBe('c2');
    });
});
