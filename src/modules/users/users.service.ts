import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';
import { DeepPartial, FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { CrudContract } from '~/common/interfaces';
import { User } from './entities';

@Injectable()
export class UsersService implements CrudContract<User> {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  create(data: DeepPartial<User>) {
    const create = this.repository.create(data);

    create.hashPassword();
    return this.repository.save(create);
  }

  list(query: PaginateQuery, criteria?: FindOptionsWhere<User> | FindOptionsWhere<User>[]) {
    return paginate(query, this.repository, {
      nullSort: 'last',
      sortableColumns: ['id', 'name', 'role'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name', 'email', 'role'],
      select: ['id', 'name', 'email', 'role', 'createdAt'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
        email: [FilterOperator.ILIKE],
        role: [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 100,
      where: criteria,
    });
  }

  findAll(relations?: FindOptionsRelations<User>, withDeleted?: boolean) {
    return this.repository.find({
      relations,
      withDeleted,
    });
  }

  async findBy(criteria: FindOptionsWhere<User>, relations?: FindOptionsRelations<User>, withDeleted?: boolean) {
    return this.repository.find({
      where: criteria,
      relations,
      withDeleted,
    });
  }

  async findOne(id: number, relations?: FindOptionsRelations<User>, withDeleted?: boolean) {
    return this.repository.findOne({
      relations,
      withDeleted,
      where: { id },
    });
  }

  async findOneBy(criteria: FindOptionsWhere<User>, relations?: FindOptionsRelations<User>, withDeleted?: boolean) {
    return this.repository.findOne({
      where: criteria,
      relations,
      withDeleted,
    });
  }

  async update(data: DeepPartial<User>) {
    const finded = await this.findOne(data.id);
    if (!finded) throw new NotFoundException('Usuário não encontrado');

    this.repository.merge(finded, data);
    return this.repository.save(finded);
  }

  async remove(id: number) {
    const finded = await this.findOne(id);
    if (!finded) throw new NotFoundException('Usuário não encontrado');

    return this.repository.remove(finded);
  }

  async softRemove(id: number) {
    const finded = await this.findOne(id);
    if (!finded) throw new NotFoundException('Usuário não encontrado');

    return this.repository.softRemove(finded);
  }

  async recover(id: number) {
    const finded = await this.findOne(id, undefined, true);
    if (!finded) throw new NotFoundException('Usuário não encontrado');

    return this.repository.recover(finded);
  }
}
