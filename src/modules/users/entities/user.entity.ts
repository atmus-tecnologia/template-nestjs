import bcryptjs from 'bcryptjs';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { EntityAbstract } from '~/common/abstracts';
import { Workspace } from '~/modules/workspaces/entities';
import { UserRoleEnum } from '../enums';

@Entity('users')
export class User extends EntityAbstract {
  @Column()
  name: string;

  @Column('enum', {
    enum: UserRoleEnum,
    default: UserRoleEnum.CLIENT,
  })
  role: UserRoleEnum;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ name: 'token_verify_email', nullable: true })
  tokenVerifyEmail?: string;

  @Column()
  password: string;

  @Column({ name: 'token_reset_password', nullable: true })
  tokenResetPassword?: string;

  @Column({ name: 'last_email_change_password', nullable: true })
  lastEmailChangePassword?: Date;

  @ManyToMany(() => Workspace, workspace => workspace.users)
  @JoinTable({
    name: 'users_workspaces',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'workspace_id', referencedColumnName: 'id' },
  })
  workspaces: Workspace[];

  @Column({ name: 'last_workspace_id', nullable: true })
  lastWorkspaceId?: string;

  // ** Workspace selecionado pelo usuário
  workspace?: Workspace;

  hashPassword() {
    this.password = bcryptjs.hashSync(this.password, 8);
  }

  isValidPassword(password: string) {
    return bcryptjs.compareSync(password, this.password);
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    delete obj.tokenResetPassword;

    return obj;
  }
}
