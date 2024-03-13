import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Event } from '../events/events.entity';
import { User } from '../users/users.entity';

@Entity()
export class ListsMember {
  @PrimaryColumn()
  eventId: number;

  @PrimaryColumn()
  userId: number;

  @Column({ default: false })
  isParticipant: boolean;

  @ManyToOne(() => Event, event => event.listsMembers)
  event: Event;

  @ManyToOne(() => User, user => user.listsMembers)
  user: User;
}
