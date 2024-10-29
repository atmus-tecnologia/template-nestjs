import { PaginateConfig, PaginateQuery, Paginated } from 'nestjs-paginate';
import { DeepPartial, FindOptionsRelations, FindOptionsWhere as TypeOrmFindOptionsWhere } from 'typeorm';

export type FindOptionsWhere<T> = TypeOrmFindOptionsWhere<T> | TypeOrmFindOptionsWhere<T>[];
export interface CrudContract<T> {
  list(query: PaginateQuery, config?: Partial<PaginateConfig<T>>): Promise<Paginated<T>>;
  create(data: DeepPartial<T>): Promise<T>;
  findAll(relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T[]>;
  findBy(criteria: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T[]>;
  findOne(id: string, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T>;
  findOneBy(criteria: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T>;
  update(data: DeepPartial<T>): Promise<T>;
  remove(id: string): Promise<T>;
  softRemove(id: string): Promise<T>;
  recover(id: string): Promise<T>;
}
