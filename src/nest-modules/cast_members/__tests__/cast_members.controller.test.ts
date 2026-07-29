import {Test, TestingModule} from '@nestjs/testing';
import {ConfigModule} from '@/nest-modules/config/config.module';
import {DatabaseModule} from '@/nest-modules/database/database.module';
import {CastMembersController} from '@/nest-modules/cast_members/cast_members.controller';
import {CastMembersModule} from '@/nest-modules/cast_members/cast_members.module';
import {UpdateCastmemberDto} from '@/nest-modules/cast_members/dto/update-cast-member.dto';
import {SearchCastMembersDto} from '@/nest-modules/cast_members/dto/search-cast-member.dto';
import {CAST_MEMBER_PROVIDERS} from '@/nest-modules/cast_members/cast_members.providers';
import {
	CastMemberCollectionPresenter,
	CastMemberPresenter
} from '@/nest-modules/cast_members/cast_members.presenter';
import {
	CreateCastMemberFixture,
	ListCastMembersFixture,
	UpdateCastMemberFixture
} from '@/nest-modules/cast_members/testing/cast_member_fixture';
import {ICastMemberRepository} from '@core/cast_member/domain/cast_member.repository';
import {CastMember, CastMemberId} from '@core/cast_member/domain/cast_member.aggregate';
import {CastMemberOutputMapper} from '@core/cast_member/application/usecases/common/cast_member_output';
import {
	CreateCastMemberUsecase
} from '@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase';
import {
	UpdateCastMemberUsecase
} from '@core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase';
import {
	DeleteCastMemberUsecase
} from '@core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase';
import {
	ListCastMembersUsecase
} from '@core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase';
import {GetCastMemberUsecase} from '@core/cast_member/application/usecases/get_cast_member/get_cast_member.usecase';
import {NotFoundError} from '@core/@shared/domain/errors/not_found.error';

describe('CastMembersController Integration Tests', () => {
	let controller: CastMembersController;
	let repository: ICastMemberRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule]
		}).compile();
		controller = module.get<CastMembersController>(CastMembersController);
		repository = module.get<ICastMemberRepository>(
			CAST_MEMBER_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
		expect(controller['createUsecase']).toBeInstanceOf(CreateCastMemberUsecase);
		expect(controller['updateUsecase']).toBeInstanceOf(UpdateCastMemberUsecase);
		expect(controller['getUsecase']).toBeInstanceOf(GetCastMemberUsecase);
		expect(controller['listUsecase']).toBeInstanceOf(ListCastMembersUsecase);
		expect(controller['deleteUsecase']).toBeInstanceOf(DeleteCastMemberUsecase);
	});

	describe('create cast members', () => {
		const arrange = CreateCastMemberFixture.arrangeForCreate();

		test.each(arrange)('when body is $send_data', async ({send_data, expected}) => {
			const presenter = await controller.create(send_data);
			const entity = await repository.findById(new CastMemberId(presenter.cast_member_id));

			expect(entity).not.toBeNull();
			expect(entity!.toJSON()).toStrictEqual({
				cast_member_id: presenter.cast_member_id,
				created_at: presenter.created_at,
				...expected
			});

			const output = CastMemberOutputMapper.toOutput(entity!);
			expect(presenter).toEqual(new CastMemberPresenter(output));
		});
	});

	describe('update cast members', () => {
		const arrange = UpdateCastMemberFixture.arrangeForUpdate();

		const castMember = CastMember.fake().anActor().build();
		beforeEach(async () => {
			await repository.insert(castMember);
		});

		test.each(arrange)('when body is $send_data', async ({send_data, expected}) => {
			// `UpdateCastMemberInput.name` é declarado como `name: string` (apesar do
			// @IsOptional), então um PATCH parcial não casa com o tipo do DTO
			const presenter = await controller.update(
				castMember.cast_member_id.id,
				send_data as UpdateCastmemberDto
			);
			const entity = await repository.findById(new CastMemberId(presenter.cast_member_id));

			expect(entity).not.toBeNull();
			expect(entity!.toJSON()).toStrictEqual({
				cast_member_id: presenter.cast_member_id,
				created_at: presenter.created_at,
				name: 'name' in expected ? expected.name : castMember.name,
				type: 'type' in expected ? expected.type : castMember.type.type,
			});

			const output = CastMemberOutputMapper.toOutput(entity!);
			expect(presenter).toEqual(new CastMemberPresenter(output));
		});
	});

	test('cast member deletion', async () => {
		const castMember = CastMember.fake().aDirector().build();
		await repository.insert(castMember);

		const response = await controller.remove(castMember.cast_member_id.id);

		expect(response).not.toBeDefined();
		// `CastMemberSequelizeRepository.findById` lança NotFoundError em vez de
		// devolver null quando o registro não existe — diferente do repositório de
		// Category, que resolve para null.
		await expect(repository.findById(castMember.cast_member_id)).rejects.toThrow(NotFoundError);
	});

	test('if we can get a cast member', async () => {
		const castMember = CastMember.fake().anActor().build();
		await repository.insert(castMember);

		const presenter = await controller.findOne(castMember.cast_member_id.id);

		expect(presenter).toBeInstanceOf(CastMemberPresenter);
		expect(presenter.cast_member_id).toBe(castMember.cast_member_id.id);
		expect(presenter.name).toBe(castMember.name);
		expect(presenter.type).toBe(castMember.type.type);
		expect(presenter.created_at).toStrictEqual(castMember.created_at);
	});

	describe('search method', () => {
		describe('should sort cast members by created_at', () => {
			const {arrange, entitiesMap} = ListCastMembersFixture.arrangeIncrementedWithCreatedAt();

			beforeEach(async () => {
				await repository.bulkInsert(Object.values(entitiesMap));
			});

			test.each(arrange)('when send_data is $send_data', async ({expected, send_data}) => {
				const presenter = await controller.search(send_data);
				const {entities, meta} = expected;
				expect(presenter).toEqual(
					new CastMemberCollectionPresenter({
						items: entities.map(CastMemberOutputMapper.toOutput),
						...meta
					})
				);
			});
		});

		describe('should return cast members using pagination, sort and filter', () => {
			const {arrange, entitiesMap} = ListCastMembersFixture.arrangeUnsorted();

			beforeEach(async () => {
				await repository.bulkInsert(Object.values(entitiesMap));
			});

			test.each(arrange)('when send_data is $send_data', async ({expected, send_data}) => {
				// o `sort_dir` da fixture é inferido como string, não como SortDirection
				const presenter = await controller.search(send_data as SearchCastMembersDto);
				const {entities, meta} = expected;
				expect(presenter).toEqual(
					new CastMemberCollectionPresenter({
						items: entities.map(CastMemberOutputMapper.toOutput),
						...meta
					})
				);
			});
		});
	});
});
