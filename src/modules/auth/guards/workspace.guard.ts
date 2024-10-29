import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // ** Se o usuário não tiver um workspace selecionado, não pode continuar
    if (!Boolean(user.workspace)) throw new BadRequestException('Para continuar, é necessário que você selecione um workspace.');

    return true;
  }
}
