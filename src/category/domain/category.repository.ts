import {IRepository} from "@/@shared/domain/repository/repository_interface";
import {Category} from "@/category/domain/category.entity";
import {Uuid} from "@/@shared/domain/value_objects/uuid.vo";

export interface ICategoryRepository extends IRepository<Category, Uuid> {}