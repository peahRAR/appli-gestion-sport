import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ListsMember {
  @PrimaryColumn()
  eventId: number;

  @PrimaryColumn()
  userId: number;

  @Column({ default: false }) // Champ booléen pour indiquer la participation
  isParticipant: boolean;

}
