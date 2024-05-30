import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Event } from '../events/events.entity';

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

  @ManyToMany(() => Event)
  @JoinTable()
  events: Event[];
  listsMembers: any;
  useremail: any;
}
