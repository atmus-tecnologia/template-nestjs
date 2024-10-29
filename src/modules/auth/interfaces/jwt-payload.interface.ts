import { UserRoleEnum } from '~/modules/users/enums';

export interface JwtPayload {
  id: number;
  remoteAddress?: string;
  role?: UserRoleEnum;
  tokenType: 'user' | 'reset-password' | 'verify-email';
  token?: string;
  workspaceId?: number;
}
