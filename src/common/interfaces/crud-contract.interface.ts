import { PaginateQuery, Paginated } from 'nestjs-paginate';
import { DeepPartial, FindOptionsRelations, FindOptionsWhere } from 'typeorm';

export interface CrudContract<T> {
  list(query: PaginateQuery, criteria?: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<Paginated<T>>;
  create(data: DeepPartial<T>): Promise<T>;
  findAll(relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T[]>;
  findBy(criteria: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T[]>;
  findOne(id: number, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T>;
  findOneBy(criteria: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>, withDeleted?: boolean): Promise<T>;
  update(data: DeepPartial<T>): Promise<T>;
  remove(id: number): Promise<T>;
  softRemove(id: number): Promise<T>;
  recover(id: number): Promise<T>;
}
