import {CategoryCollectionPresenter, CategoryPresenter} from "@/nest-modules/categories/categories.presenter";
import { instanceToPlain } from "class-transformer";

describe('CategoriesPresenter Unit Tests', () => {
    test('CategoryPresenter', () => {
    const date = new Date();
        const presenter = new CategoryPresenter({
            id: 'Some-Id',
            name: 'Some Name',
            description: null,
            is_active: true,
            created_at: date,
        });

        const presenterPlain: CategoryPresenter = instanceToPlain(presenter) as CategoryPresenter;

        expect(presenterPlain.id).toBe('Some-Id');
        expect(presenterPlain.name).toBe('Some Name');
        expect(presenterPlain.description).toBe(null);
        expect(presenterPlain.is_active).toBe(true);
        expect(presenterPlain.created_at).not.toBe(date);
        expect(presenterPlain.created_at).toBe(date.toISOString());
    });

    test('CategoryCollectionPresenter', () => {
        const date = new Date();
        const presenterOne = new CategoryPresenter({
            id: 'Some-Id',
            name: 'Some Name',
            description: null,
            is_active: true,
            created_at: date,
        });
        const presenterTwo = new CategoryPresenter({
            id: 'Other-Id',
            name: 'Other Name',
            description: 'Other Description',
            is_active: false,
            created_at: date,
        });

        const collectionPresenter = new CategoryCollectionPresenter({
            items: [presenterOne, presenterTwo],
            current_page: 1,
            per_page: 2,
        });

        const presenterPlain = instanceToPlain(collectionPresenter);

        expect(presenterPlain).toStrictEqual({
            data: [
                {
                    id: 'Some-Id',
                    name: 'Some Name',
                    description: null,
                    is_active: true,
                    created_at: date.toISOString(),
                },
                {
                    id: 'Other-Id',
                    name: 'Other Name',
                    description: 'Other Description',
                    is_active: false,
                    created_at: date.toISOString(),
                },
            ],
            meta: {
                current_page: 1,
                per_page: 2,
                last_page: 1,
                total: 2,
            },
        });

    });
});