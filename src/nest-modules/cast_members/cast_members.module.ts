import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {CastMemberModel} from "@core/cast_member/infra/db/sequelize/cast_member.model";
import {CastMembersController} from "@/nest-modules/cast_members/cast_members.controller";
import {CAST_MEMBER_PROVIDERS} from "@/nest-modules/cast_members/cast_members.providers";

@Module({
  imports: [SequelizeModule.forFeature([CastMemberModel])],
  controllers: [CastMembersController],
  providers: [
    ...Object.values(CAST_MEMBER_PROVIDERS.REPOSITORIES),
    ...Object.values(CAST_MEMBER_PROVIDERS.USE_CASES),
  ]
})
export class CastMembersModule {}
