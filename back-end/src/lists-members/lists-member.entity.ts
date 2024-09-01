import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Index } from 'typeorm';
import { Event } from '../events/events.entity';
import { User } from '../users/entities/users.entity';

@Entity()
@Index(['eventId', 'userId'], { unique: true })
export class ListsMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, event => event.listsMembers, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User, user => user.listsMembers, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  eventId: number;

  @Column()
  userId: string;

  @Column({ default: false })
  isParticipant: boolean;
}
