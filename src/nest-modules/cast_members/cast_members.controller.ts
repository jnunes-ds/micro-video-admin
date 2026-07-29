import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpCode,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateCastMemberUsecase
} from "@core/cast_member/application/usecases/create_cast_member/create_cast_member.usecase";
import {
  UpdateCastMemberUsecase
} from "@core/cast_member/application/usecases/update_cast_member/update_cast_member.usecase";
import {
  DeleteCastMemberUsecase
} from "@core/cast_member/application/usecases/delete_cast_member/delete_cast_member.usecase";
import {
  ListCastMembersUsecase
} from "@core/cast_member/application/usecases/list_cast_members/list_cast_members.usecase";
import {CreateCastMemberDto} from "@/nest-modules/cast_members/dto/create-cast-member.dto";
import {UpdateCastmemberDto} from "@/nest-modules/cast_members/dto/update-cast-member.dto";
import {SearchCastMembersDto} from "@/nest-modules/cast_members/dto/search-cast-member.dto";
import {CastMemberCollectionPresenter, CastMemberPresenter} from "@/nest-modules/cast_members/cast_members.presenter";
import {CastMemberOutput} from "@core/cast_member/application/usecases/common/cast_member_output";
import {GetCastMemberUsecase} from "@core/cast_member/application/usecases/get_cast_member/get_cast_member.usecase";

@Controller('cast-members')
export class CastMembersController {

  @Inject(CreateCastMemberUsecase)
  private createUsecase: CreateCastMemberUsecase;

  @Inject(UpdateCastMemberUsecase)
  private updateUsecase: UpdateCastMemberUsecase;

  @Inject(DeleteCastMemberUsecase)
  private deleteUsecase: DeleteCastMemberUsecase;

  @Inject(GetCastMemberUsecase)
  private getUsecase: GetCastMemberUsecase;

  @Inject(ListCastMembersUsecase)
  private listUsecase: ListCastMembersUsecase;

  @Post()
  async create(@Body() createCastmemberDto: CreateCastMemberDto) {
    const output = await this.createUsecase.execute(createCastmemberDto);
    return CastMembersController.serialize(output);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string) {
    const output = await this.getUsecase.execute({id});
    return CastMembersController.serialize(output);
  }

  @Get()
  async search(@Query() searchParamsDto: SearchCastMembersDto) {
    const output = await this.listUsecase.execute(searchParamsDto);
    return new CastMemberCollectionPresenter(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string,
    @Body() updateCategoryDto: UpdateCastmemberDto
  ) {
    const output = await this.updateUsecase.execute({cast_member_id: id, ...updateCategoryDto});
    return CastMembersController.serialize(output);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string) {
    await this.deleteUsecase.execute({id});
  }

  public static serialize(output: CastMemberOutput): CastMemberPresenter {
    return new CastMemberPresenter(output);
  }
}
