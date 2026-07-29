import {Provider} from "@nestjs/common";
import {getModelToken} from "@nestjs/sequelize";
import {CastMemberSequelizeRepository} from "@core/cast_member/infra/db/sequelize/cast_member-sequelize.repository";
import {CastMemberInMemoryRepository} from "@core/cast_member/infra/db/in_memory/cast_member_in_memory.repository";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {ICastMemberRepository} from "@core/cast_member/domain/cast_member.repository";
import {
	CreateCastMemberUsecase
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase";
import {
	UpdateCastMemberUsecase
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase";
import {
	ListCastMembersUsecase
} from "@core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase";
import {
	DeleteCastMemberUsecase
} from "@core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase";
import {GetCastMemberUsecase} from "@core/cast_member/application/usecases/get_cast_member/get_cast_member.usecase";

export type ObjectProvider = Exclude<Provider, Function | string | symbol>;

type Providers<T extends string> = {
	[key in T]: ObjectProvider;
};


enum RepositoriesKeysEnum {
	CAST_MEMBER_REPOSITORY = 'CAST_MEMBER_REPOSITORY',
	CAST_MEMBER_IN_MEMORY_REPOSITORY = 'CAST_MEMBER_IN_MEMORY_REPOSITORY',
	CAST_MEMBER_SEQUELIZE_REPOSITORY = 'CAST_MEMBER_SEQUELIZE_REPOSITORY'
}

type Repositories = Providers<RepositoriesKeysEnum>

export const REPOSITORIES: Repositories = {
	CAST_MEMBER_REPOSITORY: {
		provide: 'CastMemberRepository',
		useExisting: CastMemberSequelizeRepository,
	},
	CAST_MEMBER_IN_MEMORY_REPOSITORY: {
		provide: CastMemberInMemoryRepository,
		useClass: CastMemberInMemoryRepository
	},
	CAST_MEMBER_SEQUELIZE_REPOSITORY: {
		provide: CastMemberSequelizeRepository,
		useFactory: (castMemberModel: typeof CastMemberModel) => new CastMemberSequelizeRepository(castMemberModel),
		inject: [getModelToken(CastMemberModel)]
	}
};

enum UseCasesKeysEnum  {
	CREATE_CAST_MEMBER_USE_CASE = 'CREATE_CAST_MEMBER_USE_CASE',
	UPDATE_CAST_MEMBER_USE_CASE = 'UPDATE_CAST_MEMBER_USE_CASE',
	GET_CAST_MEMBER_USE_CASE = 'GET_CAST_MEMBER_USE_CASE',
	LIST_CAST_MEMBERS_USE_CASE = 'LIST_CAST_MEMBERS_USE_CASE',
	DELETE_CAST_MEMBER_USE_CASE = 'DELETE_CAST_MEMBER_USE_CASE'
}

type Usecases = Providers<UseCasesKeysEnum>;

export const USE_CASES: Usecases = {
	CREATE_CAST_MEMBER_USE_CASE: {
		provide: CreateCastMemberUsecase,
		useFactory: (castMemberRepo: ICastMemberRepository) => new CreateCastMemberUsecase(castMemberRepo),
		inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY['provide']]
	},
	UPDATE_CAST_MEMBER_USE_CASE: {
		provide: UpdateCastMemberUsecase,
		useFactory: (castMemberRepo: ICastMemberRepository) => new UpdateCastMemberUsecase(castMemberRepo),
		inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY['provide']]
	},
	GET_CAST_MEMBER_USE_CASE: {
		provide: GetCastMemberUsecase,
		useFactory: (castMemberRepo: ICastMemberRepository) => new GetCastMemberUsecase(castMemberRepo),
		inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY['provide']]
	},
	LIST_CAST_MEMBERS_USE_CASE: {
		provide: ListCastMembersUsecase,
		useFactory: (castMemberRepo: ICastMemberRepository) => new ListCastMembersUsecase(castMemberRepo),
		inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY['provide']]
	},
	DELETE_CAST_MEMBER_USE_CASE: {
		provide: DeleteCastMemberUsecase,
		useFactory: (castMemberRepo: ICastMemberRepository) => new DeleteCastMemberUsecase(castMemberRepo),
		inject: [REPOSITORIES.CAST_MEMBER_REPOSITORY['provide']]
	}
};

export const CAST_MEMBER_PROVIDERS = {
	REPOSITORIES,
	USE_CASES,
}
