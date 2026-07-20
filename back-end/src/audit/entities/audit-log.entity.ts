import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  actorUserId: string;

  @Column()
  action: string;

  @Column({ type: 'int' })
  affectedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
