import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

// One row per browser/device subscription — a user can have several
// (phone + laptop, etc.). `endpoint` is unique: re-subscribing the same
// browser (e.g. after a permission reset) updates the existing row instead
// of accumulating duplicates.
@Entity()
@Unique(['endpoint'])
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'text' })
  endpoint: string;

  @Column()
  p256dh: string;

  @Column()
  auth: string;

  @CreateDateColumn()
  createdAt: Date;
}
