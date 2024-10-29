import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentWorkspace = createParamDecorator((param: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const workspace = request.workspace;

  return param ? workspace && workspace[param] : workspace;
});
