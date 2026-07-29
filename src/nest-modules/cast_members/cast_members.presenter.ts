import {Transform} from "class-transformer";
import {CollectionPresenter} from "@/nest-modules/shared/collection.presenter";
import {
	ListCastmembersOutput
} from "@core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase";
import {CastMemberOutput} from "@core/cast_member/application/usecases/common/cast_member_output";
import {CastMemberTypes} from "@core/cast_member/domain/cast-member-type.vo";

export class CastMemberPresenter {
	cast_member_id: string;
	name: string;
	type: CastMemberTypes;
	@Transform(({value}: {value: Date}) => value.toISOString())
	created_at: Date;

	constructor(output: CastMemberOutput) {
		this.cast_member_id = output.cast_member_id;
		this.name = output.name;
		this.type = output.type;
		this.created_at = output.created_at;
	}
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
	data: CastMemberPresenter[];

	constructor(output: ListCastmembersOutput) {
		const {items, ...paginationProps} = output;
		super(paginationProps);
		this.data = items.map(item => new CastMemberPresenter(item));
	}
}