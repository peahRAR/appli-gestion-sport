import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ListsMember } from 'src/lists-members/lists-member.entity';

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

  @OneToMany(() => ListsMember, listsMember => listsMember.event, { cascade: ['remove'] })
  listsMembers: ListsMember[];
}
