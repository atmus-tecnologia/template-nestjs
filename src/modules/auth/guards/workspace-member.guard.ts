import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { params, user } = context.switchToHttp().getRequest<Request>();
    const isWorkspaceMember = user.workspaces.some(workspace => workspace.id === params.id);
    return isWorkspaceMember;
  }
}
