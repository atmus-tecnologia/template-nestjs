import bcryptjs from 'bcryptjs';
import { Column, Entity } from 'typeorm';
import { EntityAbstract } from '~/common/abstracts';
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

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  tokenVerifyEmail?: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  tokenResetPassword?: string;

  @Column({ nullable: true })
  lastEmailChangePassword?: Date;

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
