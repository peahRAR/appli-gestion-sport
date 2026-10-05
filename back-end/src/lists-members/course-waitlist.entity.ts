import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Index } from 'typeorm';
import { Event } from '../events/events.entity';
import { User } from '../users/entities/users.entity';

// L'id auto-incrémenté sert d'ordre d'arrivée : quitter la file puis se
// réinscrire crée une nouvelle ligne, donc une nouvelle dernière position.
@Entity('course_waitlist')
@Index(['eventId', 'userId'], { unique: true })
export class CourseWaitlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  eventId: number;

  @Column()
  userId: string;
}
