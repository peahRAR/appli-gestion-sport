
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResetPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  // Opaque random token (crypto.randomBytes), not a JWT — decoupled from the
  // login JWT_SECRET/JWT_EXP so this flow has its own, dedicated lifetime.
  @Column()
  token: string;

  @Column()
  expires: Date;

  // Kept (instead of deleting the row on use) so a second attempt with the
  // same token can be told apart from "expired"/"never existed".
  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date | null;
}
