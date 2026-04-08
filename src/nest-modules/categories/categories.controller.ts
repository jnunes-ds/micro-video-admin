import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {UpdateCategoryUsecase} from "@core/category/application/usecases/update_category/update_category.usecase";
import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";
import {GetCategoryUsecase} from "@core/category/application/usecases/get_category/get_category.usecase";
import {ListCategoriesUsecase} from "@core/category/application/usecases/list_categories/list_categories.usecase";
import {CreateCategoryDto} from "@/nest-modules/categories/dto/create-category.dto";
import {CategoryPresenter} from "@/nest-modules/categories/categories.presenter";
import {CategoryOutput} from "@core/category/application/usecases/common/category_output";

@Controller('categories')
export class CategoriesController {

  @Inject(CreatecategoryUsecase)
  private createUsecase: CreatecategoryUsecase;

  @Inject(UpdateCategoryUsecase)
  private updateUsecase: UpdateCategoryUsecase;

  @Inject(DeleteCategoryUsecase)
  private deleteUsecase: DeleteCategoryUsecase;

  @Inject(GetCategoryUsecase)
  private getUsecase: GetCategoryUsecase;

  @Inject(ListCategoriesUsecase)
  private listUsecase: ListCategoriesUsecase;

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const output = await this.createUsecase.execute(createCategoryDto);
    return CategoriesController.serialize(output);
  }

  @Get()
  findAll() {

  }

  @Get(':id')
  findOne(@Param('id') id: string) {

  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const output = await this.updateUsecase.execute({id, ...updateCategoryDto});
    return CategoriesController.serialize(output);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY})) id: string) {
    await this.deleteUsecase.execute({id});
  }

  private static serialize(output: CategoryOutput): CategoryPresenter {
    return new CategoryPresenter(output);
  }
}
