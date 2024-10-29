import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { EntityAbstract } from '~/common/abstracts';
import { User } from '~/modules/users/entities';

@Entity('workspaces')
export class Workspace extends EntityAbstract {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'manager_id' })
  managerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToMany(() => User, user => user.workspaces)
  users: User[];
}
