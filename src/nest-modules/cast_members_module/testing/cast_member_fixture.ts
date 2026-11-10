import {CastMember} from "@core/cast_member/domain/cast_member.aggregate";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";

const _keysInResponse = [
	'cast_member_id',
	'name',
	'type',
	'created_at',
];

export class GetCastMemberFixture {
	static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
	static keysInResponse = _keysInResponse;

	static arrangeForCreate() {
		const faker = CastMember.fake().anActor().withName('John Doe');
		return [
			{
				send_data: {
					name: faker.name,
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					name: faker.name,
					type: CastMemberTypes.ACTOR,
				},
			},
			{
				send_data: {
					name: faker.name,
					type: CastMemberTypes.DIRECTOR,
				},
				expected: {
					name: faker.name,
					type: CastMemberTypes.DIRECTOR,
				},
			},
			{
				send_data: {
					name: 'a'.repeat(255),
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					name: 'a'.repeat(255),
					type: CastMemberTypes.ACTOR,
				},
			},
			{
				send_data: {
					name: '  John  ',
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					name: '  John  ',
					type: CastMemberTypes.ACTOR,
				},
			},
		];
	}

	static arrangeInvalidRequest() {
		const defaultExpected = {
			statusCode: 422,
			error: 'Unprocessable Entity',
		};

		return {
			EMPTY: {
				send_data: {},
				expected: {
					message: [
						'name should not be empty',
						'name must be a string',
						'type should not be empty',
						'type must be an integer number',
					],
					...defaultExpected,
				},
			},
			NAME_UNDEFINED: {
				send_data: {
					name: undefined,
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					message: ['name should not be empty', 'name must be a string'],
					...defaultExpected,
				},
			},
			NAME_NULL: {
				send_data: {
					name: null,
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					message: ['name should not be empty', 'name must be a string'],
					...defaultExpected,
				},
			},
			NAME_EMPTY: {
				send_data: {
					name: '',
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					message: ['name should not be empty'],
					...defaultExpected,
				},
			},
			TYPE_UNDEFINED: {
				send_data: {
					name: 'x',
					type: undefined,
				},
				expected: {
					message: ['type should not be empty', 'type must be an integer number'],
					...defaultExpected,
				},
			},
			TYPE_NULL: {
				send_data: {
					name: 'x',
					type: null,
				},
				expected: {
					message: ['type should not be empty', 'type must be an integer number'],
					...defaultExpected,
				},
			},
			TYPE_NOT_A_NUMBER: {
				send_data: {
					name: 'x',
					type: 'a',
				},
				expected: {
					message: ['type must be an integer number'],
					...defaultExpected,
				},
			},
			TYPE_NOT_AN_INTEGER: {
				send_data: {
					name: 'x',
					type: 1.5,
				},
				expected: {
					message: ['type must be an integer number'],
					...defaultExpected,
				},
			},
		};
	}

	static arrangeForEntityValidationError() {
		const faker = CastMember.fake().anActor();
		const defaultExpected = {
			statusCode: 422,
			error: 'Unprocessable Entity',
		};

		return {
			NAME_TOO_LONG: {
				send_data: {
					name: faker.withInvalidNameTooLong().name,
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					message: ['name must be shorter than or equal to 255 characters'],
					...defaultExpected,
				},
			},
			TYPE_INVALID: {
				send_data: {
					name: 'x',
					type: 3,
				},
				expected: {
					message: ['Invalid cast member type: 3'],
					...defaultExpected,
				},
			},
			TYPE_ZERO: {
				send_data: {
					name: 'x',
					type: 0,
				},
				expected: {
					message: ['Invalid cast member type: 0'],
					...defaultExpected,
				},
			},
			NAME_TOO_LONG_AND_TYPE_INVALID: {
				send_data: {
					name: faker.withInvalidNameTooLong().name,
					type: 3,
				},
				expected: {
					message: [
						'name must be shorter than or equal to 255 characters',
						'Invalid cast member type: 3',
					],
					...defaultExpected,
				},
			},
		};
	}
}

export class UpdateCastMemberFixture {
	static keysInResponse = _keysInResponse;

	static arrangeForUpdate() {
		return [
			{
				send_data: {
					name: 'John Updated',
				},
				expected: {
					name: 'John Updated',
				},
			},
			{
				send_data: {
					type: CastMemberTypes.DIRECTOR,
				},
				expected: {
					type: CastMemberTypes.DIRECTOR,
				},
			},
			{
				send_data: {
					name: 'Jane',
					type: CastMemberTypes.DIRECTOR,
				},
				expected: {
					name: 'Jane',
					type: CastMemberTypes.DIRECTOR,
				},
			},
			{
				send_data: {
					name: 'Jane',
					type: CastMemberTypes.ACTOR,
				},
				expected: {
					name: 'Jane',
					type: CastMemberTypes.ACTOR,
				},
			},
		];
		// Nota: um caso com `send_data: {}` foi propositalmente omitido daqui.
		// `CastMemberSequelizeRepository.update` verifica `affectedRows !== 1` e
		// lança `NotFoundError` — mas o driver mysql2 reporta *linhas alteradas*,
		// não *linhas casadas pelo WHERE*. Um PATCH que não muda nenhum valor
		// (corpo vazio, ou valores iguais aos já persistidos) gera `affectedRows
		// === 0` e um 404 espúrio em vez de um 200 no-op. Ver o describe
		// 'no-op and edge cases' no spec, que documenta esse bug diretamente.
	}

	static arrangeInvalidRequest() {
		const defaultExpected = {
			statusCode: 422,
			error: 'Unprocessable Entity',
		};

		return {
			NAME_NOT_A_STRING: {
				send_data: {
					name: 5,
				},
				expected: {
					message: ['name must be a string'],
					...defaultExpected,
				},
			},
			TYPE_NOT_A_NUMBER: {
				send_data: {
					type: 'a',
				},
				expected: {
					message: ['type must be an integer number'],
					...defaultExpected,
				},
			},
			TYPE_NOT_AN_INTEGER: {
				send_data: {
					type: 1.5,
				},
				expected: {
					message: ['type must be an integer number'],
					...defaultExpected,
				},
			},
			NAME_AND_TYPE_INVALID: {
				send_data: {
					name: 5,
					type: 'a',
				},
				expected: {
					message: ['name must be a string', 'type must be an integer number'],
					...defaultExpected,
				},
			},
		};
	}

	static arrangeForEntityValidationError() {
		const faker = CastMember.fake().anActor();
		const defaultExpected = {
			statusCode: 422,
			error: 'Unprocessable Entity',
		};

		return {
			NAME_TOO_LONG: {
				send_data: {
					name: faker.withInvalidNameTooLong().name,
				},
				expected: {
					message: ['name must be shorter than or equal to 255 characters'],
					...defaultExpected,
				},
			},
		};
	}
}

export class ListCastMembersFixture {
	static arrangeIncrementedWithCreatedAt() {
		const _entities = CastMember.fake()
			.theCastMembers(4)
			.withName((i) => i + '')
			.withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
			.build();

		const entitiesMap = {
			first: _entities[0],
			second: _entities[1],
			third: _entities[2],
			fourth: _entities[3],
		};

		const arrange = [
			{
				send_data: {},
				expected: {
					entities: [
						entitiesMap.fourth,
						entitiesMap.third,
						entitiesMap.second,
						entitiesMap.first,
					],
					meta: {
						current_page: 1,
						last_page: 1,
						per_page: 15,
						total: 4,
					},
				},
			},
			{
				send_data: {
					page: 1,
					per_page: 2,
				},
				expected: {
					entities: [entitiesMap.fourth, entitiesMap.third],
					meta: {
						current_page: 1,
						last_page: 2,
						per_page: 2,
						total: 4,
					},
				},
			},
			{
				send_data: {
					page: 2,
					per_page: 2,
				},
				expected: {
					entities: [entitiesMap.second, entitiesMap.first],
					meta: {
						current_page: 2,
						last_page: 2,
						per_page: 2,
						total: 4,
					},
				},
			},
			{
				send_data: {
					page: 3,
					per_page: 2,
				},
				expected: {
					entities: [],
					meta: {
						current_page: 3,
						last_page: 2,
						per_page: 2,
						total: 4,
					},
				},
			},
		];

		return {arrange, entitiesMap};
	}

	static arrangeUnsorted() {
		const faker = CastMember.fake().anActor();

		const entitiesMap = {
			a: faker.withName('a').build(),
			AAA: faker.withName('AAA').build(),
			AaA: faker.withName('AaA').build(),
			b: faker.withName('b').build(),
			c: faker.withName('c').build(),
		};

		const arrange = [
			{
				send_data: {
					page: 1,
					per_page: 2,
					sort: 'name',
					filter: {name: 'a'},
				},
				expected: {
					entities: [entitiesMap.AAA, entitiesMap.AaA],
					meta: {
						total: 3,
						current_page: 1,
						last_page: 2,
						per_page: 2,
					},
				},
			},
			{
				send_data: {
					page: 2,
					per_page: 2,
					sort: 'name',
					filter: {name: 'a'},
				},
				expected: {
					entities: [entitiesMap.a],
					meta: {
						total: 3,
						current_page: 2,
						last_page: 2,
						per_page: 2,
					},
				},
			},
			{
				send_data: {
					page: 1,
					per_page: 2,
					sort: 'name',
					sort_dir: 'desc',
					filter: {name: 'a'},
				},
				expected: {
					entities: [entitiesMap.a, entitiesMap.AaA],
					meta: {
						total: 3,
						current_page: 1,
						last_page: 2,
						per_page: 2,
					},
				},
			},
		];

		return {arrange, entitiesMap};
	}
}
