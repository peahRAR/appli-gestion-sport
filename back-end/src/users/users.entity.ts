import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import {Event} from '../events/events.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  email: string; 

  @Column({ length: 50 })
  firstname: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  password: string;

  @Column({ type: 'date' })
  birthday: Date;

  @Column({ type: 'boolean' })
  gender: boolean;

  @Column({ length: 20, nullable: true })
  tel_medic: string;

  @Column({ length: 20, nullable: true })
  tel_emergency: string;

  @Column('float')
  weight: number;

  @Column({ length: 50, nullable: true })
  licence: string;

  @Column({ type: 'date', nullable: true })
  date_subscribe: Date;

  @Column({ type: 'date', nullable: true })
  date_payment: Date;

  @Column({ type: 'date', nullable: true })
  date_end_pay: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({type:'int', default: 0 })
  role: number;

  @ManyToMany(() => Event)
  @JoinTable()
  events: Event[];
  listsMembers: any;
    useremail: any;
}
