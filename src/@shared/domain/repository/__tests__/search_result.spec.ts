import {SearchResult} from "@/@shared/domain/repository/search_result";

describe('SearchResult Unit Test', () => {
	test('[TEST] constructor props', () => {
		let result = new SearchResult({
			items: ['entity1', 'entity2'] as any,
			total: 4,
			current_page: 1,
			per_page: 2,
		});

		expect(result.toJSON()).toStrictEqual({
			items: ['entity1', 'entity2'],
			total: 4,
			current_page: 1,
			per_page: 2,
			last_page: 2,
		});
		result = new SearchResult({
			items: ['entity1', 'entity2'] as any,
			total: 4,
			current_page: 2,
			per_page: 2,

		});

		expect(result.toJSON()).toStrictEqual({
			items: ['entity1', 'entity2'],
			total: 4,
			current_page: 2,
			per_page: 2,
			last_page: 2,
		});

		result = new SearchResult({
			items: ['entity1', 'entity2'] as any,
			total: 10,
			current_page: 1,
			per_page: 3,
		});

		expect(result.toJSON()).toStrictEqual({
			items: ['entity1', 'entity2'],
			total: 10,
			current_page: 1,
			per_page: 3,
			last_page: 4,
		});
	});

	test('[TEST] last_page prop when total is not a multiple of per_page', () => {
		const result = new SearchResult({
			items: [] as any,
			total: 101,
			current_page: 1,
			per_page: 20,
		});

		expect(result.last_page).toBe(6);
	});

	it('[IT] should force toJSON on items', () => {
		const item = {
			toJSON: () => ({ id: '1', name: 'test' })
		};
		const result = new SearchResult({
			items: [item] as any,
			total: 1,
			current_page: 1,
			per_page: 1,
		});

		expect(result.toJSON(true)).toStrictEqual({
			items: [{ id: '1', name: 'test' }],
			total: 1,
			current_page: 1,
			per_page: 1,
			last_page: 1,

		})
	});
});