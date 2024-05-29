import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User} from '../users/users.entity';


@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  date_event: Date;

  @Column({ type: 'interval' })
  duration: string;

  @Column()
  places: number;

  @Column()
  totalPlaces: number;

  @Column()
  name_event: string;

  @Column()
  coach: string;

  @Column({ nullable: true })
  overview: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];
  listsMembers: any;
}
