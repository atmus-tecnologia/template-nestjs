import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { DeepPartial, FindOptionsRelations, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { CrudContract } from '~/common/contracts';
import { User } from '~/modules/users/entities';
import { UsersService } from '../users';
import { UserRoleEnum } from '../users/enums';
import { BindUserDto, UnbindUserDto } from './dto';
import { Workspace } from './entities';

@Injectable()
export class WorkspacesService implements CrudContract<Workspace> {
  constructor(@InjectRepository(Workspace) private readonly repository: Repository<Workspace>, @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService) {}

  list(query: PaginateQuery, config?: Partial<PaginateConfig<Workspace>>) {
    return paginate(query, this.repository, {
      sortableColumns: ['id', 'name'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['name'],
      select: ['id', 'name', 'active', 'createdAt'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
        zoopId: [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 100,
      ...config,
    });
  }

  create(data: DeepPartial<Workspace>) {
    const create = this.repository.create(data);
    return this.repository.save(create);
  }

  findAll(relations?: FindOptionsRelations<Workspace>, withDeleted?: boolean) {
    return this.repository.find({
      relations,
      withDeleted,
    });
  }

  async findBy(criteria: FindOptionsWhere<Workspace>, relations?: FindOptionsRelations<Workspace>, withDeleted?: boolean) {
    return this.repository.find({
      where: criteria,
      relations,
      withDeleted,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<Workspace>, withDeleted?: boolean) {
    return this.repository.findOne({
      relations,
      withDeleted,
      where: { id },
    });
  }

  async findOneBy(criteria: FindOptionsWhere<Workspace>, relations?: FindOptionsRelations<Workspace>, withDeleted?: boolean) {
    return this.repository.findOne({
      where: criteria,
      relations,
      withDeleted,
    });
  }

  async update(data: DeepPartial<Workspace>) {
    const finded = await this.findOne(data.id);
    if (!finded) throw new NotFoundException('Registro não encontrado');

    Object.assign(finded, data);
    return this.repository.save(finded);
  }

  async remove(id: string) {
    const finded = await this.findOne(id);
    if (!finded) throw new NotFoundException('Registro não encontrado');

    return this.repository.remove(finded);
  }

  async softRemove(id: string) {
    const finded = await this.findOne(id);
    if (!finded) throw new NotFoundException('Registro não encontrado');

    return this.repository.softRemove(finded);
  }

  async recover(id: string) {
    const finded = await this.findOne(id, undefined, true);
    if (!finded) throw new NotFoundException('Registro não encontrado');

    return this.repository.recover(finded);
  }

  async users(id: string, query: PaginateQuery) {
    const finded = await this.findOne(id, undefined, true);
    if (!finded) throw new NotFoundException('Registro não encontrado');
    const { managerId } = finded;

    return this.usersService.list(query, {
      select: ['id', 'name', 'email', 'createdAt'],
      searchableColumns: ['name', 'email'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
        email: [FilterOperator.ILIKE],
      },
      where: {
        id: Not(In([managerId])),
        workspaces: { id },
      },
    });
  }

  async bindUser(workspaceId: string, user: User, { email }: BindUserDto) {
    // ** Check if this user is owner of this workspace (if user is admin, this check is ignored)
    if (user.role !== UserRoleEnum.ADMIN) {
      const isWorkspaceOwner = user.workspaces.some(workspace => workspace.id === workspaceId && workspace.managerId === user.id);
      if (!isWorkspaceOwner) throw new ForbiddenException('Você não tem permissão para vincular usuários a esse workspace');
    }

    // ** Verificar se o usuário existe, se não existir, deixar criar
    const finded = await this.usersService.findOneBy({ email }, { workspaces: true });
    if (!finded) throw new NotFoundException({ message: 'Usuário não encontrado', skipError: true });

    // ** Verificar se o usuário já está vinculado a esse workspace
    const isBinded = finded.workspaces.some(workspace => workspace.id === workspaceId);
    if (isBinded) throw new BadRequestException('Usuário já vinculado a esse workspace');

    // ** Adicionar o usuário na lista de usuários do workspace
    const workspace = await this.findOne(workspaceId);
    finded.workspaces.push(workspace);

    return this.usersService.update(finded);
  }

  async unbindUser(workspaceId: string, user: User, { id }: UnbindUserDto) {
    // ** Check if this user is owner of this workspace (if user is admin, this check is ignored)
    if (user.role !== UserRoleEnum.ADMIN) {
      const isWorkspaceOwner = user.workspaces.some(workspace => workspace.id === workspaceId && workspace.managerId === user.id);
      if (!isWorkspaceOwner) throw new ForbiddenException('Você não tem permissão para desvincular usuários desse workspace');
    }

    // ** Verificar se o usuário existe
    const finded = await this.usersService.findOne(id, { workspaces: true });
    if (!finded) throw new NotFoundException('Usuário não encontrado');

    // ** Verificar se o usuário já está vinculado a esse workspace
    const isBinded = finded.workspaces.some(workspace => workspace.id === workspaceId);
    if (!isBinded) throw new BadRequestException('Usuário não vinculado a esse workspace');

    // ** Remover o usuário da lista de usuários do workspace
    finded.workspaces = finded.workspaces.filter(workspace => workspace.id !== workspaceId);
    return this.usersService.update(finded);
  }
}
