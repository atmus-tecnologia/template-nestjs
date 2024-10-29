import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRoleEnum } from '~/modules/users/enums';

@Injectable()
export class AdminOrWorkspaceManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { params, user } = context.switchToHttp().getRequest<Request>();
    const isAdmin = user.role === UserRoleEnum.ADMIN;
    if (isAdmin) return true;

    const isWorkspaceOwner = user.workspaces.some(workspace => workspace.id === params.id && workspace.manager.id === user.id);
    return isWorkspaceOwner;
  }
}
