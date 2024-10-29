import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UserRoleEnum } from '~/modules/users/enums';

@Injectable()
export class AdminOrOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const isAdmin = request.user.role === UserRoleEnum.ADMIN;
    const isOwner = request.user.id === request.params.id;

    // ** Caso o usuário seja admin ou dono do registro, ele pode acessar a rota
    return isOwner || isAdmin;
  }
}
