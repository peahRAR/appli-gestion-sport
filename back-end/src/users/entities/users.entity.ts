import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ListsMember } from 'src/lists-members/lists-member.entity';
import { KeyHolder } from 'src/keyholder/entities/keyholder.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('json')
  email: {
    identifier: string;
    data: string;
  };

  @Column('json')
  firstname: {
    identifier: string;
    data: string;
  };

  @Column('json')
  name: {
    identifier: string;
    data: string;
  };

  @Column()
  password: string;

  @Column('json')
  birthday: {
    identifier: string;
    data: string;
  };

  @Column({ type: 'boolean' })
  gender: boolean;

  @Column('json', { nullable: true })
  tel_num: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  tel_medic: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  tel_emergency: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  weight: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  license: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  date_subscribe: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  date_payment: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  date_end_pay: {
    identifier: string;
    data: string;
  };

  @Column('json', { nullable: true })
  avatar: {
    identifier: string;
    data: string;
  };

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  role: number;

  @OneToMany(() => ListsMember, listsMember => listsMember.user, { cascade: ['remove'] })
  listsMembers: ListsMember[];

  @OneToMany(() => KeyHolder, keyHolder => keyHolder.user)
  keys: KeyHolder[];
}