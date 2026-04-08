import {Controller, Get, Post, Body, Patch, Param, Delete, Inject} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {CategorySequelizeRepository} from "@core/category/infra/db/sequelize/category-sequelize.repository";
import {CreatecategoryUsecase} from "@core/category/application/usecases/create_category/create_category.usecase";
import {UpdateCategoryUseCase} from "@core/category/application/usecases/update_category/update_category.usecase";
import {DeleteCategoryUsecase} from "@core/category/application/usecases/delete_category/delete_category.usecase";
import {GetCategoryUsecase} from "@core/category/application/usecases/get_category/get_category.usecase";
import {ListCategoriesUseCase} from "@core/category/application/usecases/list_categories/list_categories.usecase";

@Controller('categories')
export class CategoriesController {

  @Inject(CreatecategoryUsecase)
  private createUsecase: CreatecategoryUsecase;

  @Inject(UpdateCategoryUseCase)
  private updateUsecase: UpdateCategoryUseCase;

  @Inject(DeleteCategoryUsecase)
  private deleteUsecase: DeleteCategoryUsecase;

  @Inject(GetCategoryUsecase)
  private getUsecase: GetCategoryUsecase;

  @Inject(ListCategoriesUseCase)
  private listUsecase: ListCategoriesUseCase;

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {

  }

  @Get()
  findAll() {

  }

  @Get(':id')
  findOne(@Param('id') id: string) {

  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {

  }

  @Delete(':id')
  remove(@Param('id') id: string) {

  }
}
