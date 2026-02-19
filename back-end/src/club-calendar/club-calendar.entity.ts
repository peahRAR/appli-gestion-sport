import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'club_calendar_events' })
export class ClubCalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 60 })
  type: string;

  @Column({ type: 'varchar', length: 60 })
  forWho: string;

  // Début : date obligatoire, heure optionnelle
  @Column({ type: 'date' })
  startDate: string; // 'YYYY-MM-DD'

  @Column({ type: 'time', nullable: true })
  startTime?: string | null; // 'HH:MM:SS' (ou 'HH:MM')

  // Fin : date et heure toutes deux optionnelles
  @Column({ type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ type: 'time', nullable: true })
  endTime?: string | null;

  // Adresse géolocalisable obligatoire
  @Column({ type: 'varchar', length: 200 })
  location: string;

  // Description optionnelle
  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string | null;
}