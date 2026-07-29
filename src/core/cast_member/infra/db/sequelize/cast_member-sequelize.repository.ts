import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";
import {CastMember, CastMemberId} from "@core/cast_member/domain/cast_member.aggregate"
import {
	CastMemberSearchParams,
	CastMemberSearchResult,
	ICastMemberRepository
} from "@core/cast_member/domain/cast_member.repository";
import {SortDirection} from "@core/@shared/domain/repository/search_params";
import { Op, literal } from 'sequelize';
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {NotFoundError} from "@core/@shared/domain/errors/not_found.error";
import {InvalidArgumentError, LoadEntityError} from "@core/@shared/domain/validators/validation.error";
import {CastMemberOutput} from "@core/cast_member/application/usecases/common/cast_member_output";

export class CastMemberSequelizeRepository implements ICastMemberRepository {
	sortableFields: string[] = ['name', 'created_at'];
	orderBy = {
		mysql: {
			name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`)
		}
	};
	constructor(private castMemberModel: typeof CastMemberModel) {}

	async insert(entity: CastMember): Promise<void> {
		await this.castMemberModel.create(entity.toJSON())
	}

	async bulkInsert(entities: CastMember[]): Promise<void> {
		await this.castMemberModel.bulkCreate(entities.map(entity => entity.toJSON()));
	}
	
	async findById(id: CastMemberId): Promise<CastMember | null> {
		const castMember = await this.castMemberModel.findByPk(id.id);
		if (!castMember) {
			throw new NotFoundError(id.id, CastMember);
		}
		return CastMemberModelMapper.toEntity(castMember);
	}

	async findAll(): Promise<CastMember[]> {
		const models = await this.castMemberModel.findAll();
		return models.map((m) => CastMemberModelMapper.toEntity(m));
	}

	async findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
		const models = await this.castMemberModel.findAll({
			where: {
				cast_member_id: {
					[Op.in]: ids.map((id) => id.id),
				}
			}
		});
		return models.map((m) => CastMemberModelMapper.toEntity(m));
	}

	async existsById(
		ids: CastMemberId[]
	): Promise<{ exists: CastMemberId[]; not_exists: CastMemberId[] }> {
		if (!ids.length) {
			throw new InvalidArgumentError(
				'Ids must be an array with at least one element'
			);
		}

		const existsCastMemberModels = await this.castMemberModel.findAll({
			attributes: ['cast_member_id'],
			where: {
				cast_member_id: {
					[Op.in]: ids.map((id) => id.id),
				}
			}
		});

		const existsCastMemberIds = existsCastMemberModels.map(
			(m) => new CastMemberId(m.cast_member_id)
		);

		const notExistsCastMemberIds = ids.filter(
			(id) => !existsCastMemberIds.some((e) => e.equals(id))
		);

		return {
			exists: existsCastMemberIds,
			not_exists: notExistsCastMemberIds
		}
	}

	async update(entity: CastMember): Promise<void> {
		const id = entity.cast_member_id.id;

		const [affectedRows] = await this.castMemberModel.update(entity.toJSON(), {
			where: { cast_member_id: id }
		});

		if (affectedRows !== 1) {
			throw new NotFoundError(id, this.getEntity())
		}
	}
	async delete(cast_member_id: CastMemberId): Promise<void> {
		const id = cast_member_id.id;
		await this.castMemberModel.destroy({
			where: { cast_member_id: id }
		});
	}

	getEntity(): new (...args: any[]) => CastMember {
		return CastMember;
	}

	async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
		const offset = (props.page - 1) * props.per_page;
		const limit = props.per_page;

		const where = {};

		if (props.filter && (props.filter.name || props.filter.type)) {
			where['name'] = {[Op.like]: `%${props.filter.name}`}
		}

		if (props.filter?.type) {
			where['type'] = props.filter.type;
		}

		const {rows: model, count} = await this.castMemberModel.findAndCountAll({
			...(props.filter && {where}),
			...(props.sort && this.sortableFields.includes(props.sort)
				? {order: this.formatSort(props.sort, props.sort_dir!)}
				: {order: [['created_at', 'DESC']]}),
			offset,
			limit
		});

		return new CastMemberSearchResult({
			items: model.map((m) => CastMemberModelMapper.toEntity(m)),
			current_page: props.page,
			per_page: props.per_page,
			total: count
		});
	}

	private formatSort(sort: string, sort_dir: SortDirection) {
		const dialect = this.castMemberModel.sequelize?.getDialect() as 'mysql';
		if (this.orderBy[dialect] && this.orderBy[sort]) {
			return this.orderBy[dialect][sort](sort_dir);
		}
		return [[sort, sort_dir]];
	}
}

export class CastMemberModelMapper {
	static toEntity(model: CastMemberModel) {
		const { cast_member_id: id, ...otherData } = model.toJSON();
		const [type, errorCastMemberType] = CastMemberType.create(otherData.type as any).asArray();

		const castMember = new CastMember({
			...otherData,
			cast_member_id: new CastMemberId(id),
			type
		});

		castMember.validate();

		const notification = castMember.notification;
		if (errorCastMemberType) {
			notification.addError(errorCastMemberType.message, 'type')
		}

		if (notification.hasErrors()) {
			throw new LoadEntityError(notification.toJSON());
		}

		return castMember;
	}

	static toOutput(entity: CastMember): CastMemberOutput {
		const {cast_member_id, ...otherProps} = entity.toJSON();
		return <CastMemberOutput>{
			cast_member_id: entity.cast_member_id.id,
			...otherProps
		}
	}
}
