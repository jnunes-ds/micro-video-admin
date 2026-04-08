import {UpdateCategoryInput} from "@core/category/application/usecases/update_category/update_category.input";
import {OmitType} from "@nestjs/mapped-types";

export class UpdateCategoryInputWithoutId extends OmitType(UpdateCategoryInput, ['id']) {}

export class UpdateCategoryDto extends UpdateCategoryInputWithoutId {}
