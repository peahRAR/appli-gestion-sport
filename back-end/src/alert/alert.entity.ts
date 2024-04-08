// alert.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  titre: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateFin: Date | null;

  
}
