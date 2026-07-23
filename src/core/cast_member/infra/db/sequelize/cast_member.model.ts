import {Column, DataType, Model, PrimaryKey, Table} from "sequelize-typescript";
import {CastMemberType} from "@core/cast_member/domain/cast-member-type.vo";

export type CastMemberModelProps = {
	cast_member_id: string;
	name: string;
	type: CastMemberType;
	created_at: Date;
};

@Table({tableName: 'categories', timestamps: false})
export class CastMemberModel extends Model<CastMemberModelProps> {
	@PrimaryKey
	@Column({type: DataType.UUID})
	declare cast_member_id: string;

	@Column({type: DataType.STRING(255), allowNull: false})
	declare name: string;

	@Column({type: DataType.SMALLINT, allowNull: false})
	declare type: CastMemberType;

	@Column({type: DataType.DATE(3), allowNull: false})
	declare created_at: Date;
}