import {CastMembersController} from '@/nest-modules/cast_members/cast_members.controller';
import {CreateCastMemberDto} from '@/nest-modules/cast_members/dto/create-cast-member.dto';
import {UpdateCastmemberDto} from '@/nest-modules/cast_members/dto/update-cast-member.dto';
import {SearchCastMembersDto} from '@/nest-modules/cast_members/dto/search-cast-member.dto';
import {
	CastMemberCollectionPresenter,
	CastMemberPresenter
} from '@/nest-modules/cast_members/cast_members.presenter';
import {
	CreateCastMemberOutput
} from '@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase';
import {CastMemberOutput} from '@core/cast_member/application/usecases/common/cast_member_output';
import {CastMemberTypes} from '@core/cast_member/domain/cast-member-type.vo';

describe('CastMembersController Unit Tests', () => {
	let controller: CastMembersController;

	beforeEach(async () => {
		controller = new CastMembersController();
	});

	it('should create a cast member', async () => {
		// ARRANGE
		const output: CreateCastMemberOutput = {
			cast_member_id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
			name: 'John Doe',
			type: CastMemberTypes.ACTOR,
			created_at: new Date(),
		};

		const mockCreateUsecase = {
			execute: jest.fn().mockResolvedValue(Promise.resolve(output))
		};

		// @ts-expect-error
		controller['createUsecase'] = mockCreateUsecase;

		const input: CreateCastMemberDto = {
			name: 'John Doe',
			type: CastMemberTypes.ACTOR,
		};

		// ACT
		const presenter = await controller.create(input);

		// ASSERT
		expect(mockCreateUsecase.execute).toHaveBeenCalledWith(input);
		expect(presenter).toBeInstanceOf(CastMemberPresenter);
		expect(presenter).toStrictEqual(new CastMemberPresenter(output));
	});

	it('should update a cast member', async () => {
		// ARRANGE
		const id = '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52';
		const output: CastMemberOutput = {
			cast_member_id: id,
			name: 'John Updated',
			type: CastMemberTypes.DIRECTOR,
			created_at: new Date(),
		};

		const mockUpdateUsecase = {
			execute: jest.fn().mockResolvedValue(output),
		};

		// @ts-expect-error
		controller['updateUsecase'] = mockUpdateUsecase;

		const input: UpdateCastmemberDto = {
			name: 'John Updated',
			type: CastMemberTypes.DIRECTOR,
		};

		// ACT
		const presenter = await controller.update(id, input);

		// ASSERT
		// o controller monta o input do usecase acrescentando o id do path
		expect(mockUpdateUsecase.execute).toHaveBeenCalledWith({
			cast_member_id: id,
			...input
		});
		expect(presenter).toBeInstanceOf(CastMemberPresenter);
		expect(presenter).toStrictEqual(new CastMemberPresenter(output));
	});

	it('should get a cast member', async () => {
		// ARRANGE
		const output: CastMemberOutput = {
			cast_member_id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
			name: 'John Doe',
			type: CastMemberTypes.DIRECTOR,
			created_at: new Date(),
		};

		const mockGetUsecase = {
			execute: jest.fn().mockResolvedValue(output),
		};

		// @ts-expect-error
		controller['getUsecase'] = mockGetUsecase;

		const input = {
			id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
		};

		// ACT
		const presenter = await controller.findOne(input.id);

		// ASSERT
		expect(mockGetUsecase.execute).toHaveBeenCalledWith(input);
		expect(presenter).toBeInstanceOf(CastMemberPresenter);
		expect(presenter).toStrictEqual(new CastMemberPresenter(output));
	});

	it('should search cast members', async () => {
		// ARRANGE
		const items: CastMemberOutput[] = [
			{
				cast_member_id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
				name: 'John Doe',
				type: CastMemberTypes.ACTOR,
				created_at: new Date(),
			},
			{
				cast_member_id: '424dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds53',
				name: 'Jane Doe',
				type: CastMemberTypes.DIRECTOR,
				created_at: new Date(),
			},
		];
		const output = {
			items,
			current_page: 1,
			per_page: 10,
			total: 2,
			last_page: 1,
		};

		const mockListUsecase = {
			execute: jest.fn().mockResolvedValue(Promise.resolve(output)),
		};

		// @ts-expect-error
		controller['listUsecase'] = mockListUsecase;

		const input = Object.assign(new SearchCastMembersDto(), {
			page: 1,
			per_page: 10,
			sort: undefined,
			sort_dir: undefined,
			filter: undefined,
		});

		// ACT
		const presenter = await controller.search(input);

		// ASSERT
		expect(mockListUsecase.execute).toHaveBeenCalledWith(input);
		expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
		expect(presenter).toStrictEqual(new CastMemberCollectionPresenter(output));
	});

	it('should search cast members using name and type filter', async () => {
		// ARRANGE
		const output = {
			items: [],
			current_page: 1,
			per_page: 15,
			total: 0,
			last_page: 0,
		};

		const mockListUsecase = {
			execute: jest.fn().mockResolvedValue(Promise.resolve(output)),
		};

		// @ts-expect-error
		controller['listUsecase'] = mockListUsecase;

		const input: SearchCastMembersDto = {
			page: 1,
			per_page: 15,
			sort: 'name',
			sort_dir: 'desc',
			filter: {name: 'John', type: CastMemberTypes.DIRECTOR},
		};

		// ACT
		const presenter = await controller.search(input);

		// ASSERT
		expect(mockListUsecase.execute).toHaveBeenCalledWith(input);
		expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
		expect(presenter).toStrictEqual(new CastMemberCollectionPresenter(output));
	});

	it('should delete a cast member', async () => {
		// ARRANGE
		const mockDeleteUsecase = {
			execute: jest.fn().mockResolvedValue(undefined),
		};

		// @ts-expect-error
		controller['deleteUsecase'] = mockDeleteUsecase;

		const input = {
			id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
		};

		// ACT
		const output = await controller.remove(input.id);

		// ASSERT
		expect(mockDeleteUsecase.execute).toHaveBeenCalledWith(input);
		expect(output).toBeUndefined();
	});

	it('should serialize an output into a presenter', () => {
		const output: CastMemberOutput = {
			cast_member_id: '324dsfw32431-432dsa-4235bfd-43252gf-6t43f64fds52',
			name: 'John Doe',
			type: CastMemberTypes.ACTOR,
			created_at: new Date(),
		};

		const presenter = CastMembersController.serialize(output);

		expect(presenter).toBeInstanceOf(CastMemberPresenter);
		expect(presenter).toStrictEqual(new CastMemberPresenter(output));
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
