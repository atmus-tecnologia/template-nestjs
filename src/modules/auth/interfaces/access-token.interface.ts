import { User } from '~/modules/users/entities';

export interface AccessToken {
  accessToken: string;
  userData?: User;
}
