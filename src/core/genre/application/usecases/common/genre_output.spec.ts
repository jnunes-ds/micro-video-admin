import { Genre } from "@core/genre/domain/genre.aggregate";
import { GenreOutputMapper } from "./genre_output";
import {Category, CategoryId} from "@core/category/domain/category.aggregate";

describe('GenreOutputMapper Unit Tests', () => {
    it('should convert a genre and categories to output', () => {
        const category1 = Category.create({ name: 'Category 1' });
        const category2 = Category.create({ name: 'Category 2' });
        const genre = Genre.create({
            name: 'Genre 1',
            categories_id: [category1.category_id, category2.category_id]
        });
        const categories = [category1, category2];

        const output = GenreOutputMapper.toOutput(genre, categories);

        expect(output).toStrictEqual({
            id: genre.genre_id.id,
            name: 'Genre 1',
            categories: [
                {
                    id: category1.category_id.id,
                    name: 'Category 1',
                    created_at: category1.created_at
                },
                {
                    id: category2.category_id.id,
                    name: 'Category 2',
                    created_at: category2.created_at
                }
            ],
            categories_id: [category1.category_id.id, category2.category_id.id],
            is_active: true,
            created_at: genre.created_at
        });
    });

    it('should convert an inactive genre to output', () => {
        const category1 = Category.create({ name: 'Category 1' });
        const genre = Genre.create({
            name: 'Genre 1',
            categories_id: [category1.category_id]
        });
        genre.deactivate();
        const categories = [category1];

        const output = GenreOutputMapper.toOutput(genre, categories);

        expect(output).toStrictEqual({
            id: genre.genre_id.id,
            name: 'Genre 1',
            categories: [
                {
                    id: category1.category_id.id,
                    name: 'Category 1',
                    created_at: category1.created_at
                }
            ],
            categories_id: [category1.category_id.id],
            is_active: false,
            created_at: genre.created_at
        });
    });

    it('should convert a genre with no categories to output', () => {
        const genre = Genre.create({
            name: 'Genre 1',
            categories_id: [] as CategoryId[]
        });
        const categories: Category[] = [];

        const output = GenreOutputMapper.toOutput(genre, categories);

        expect(output).toStrictEqual({
            id: genre.genre_id.id,
            name: 'Genre 1',
            categories: [],
            categories_id: [],
            is_active: true,
            created_at: genre.created_at
        });
    });
});
