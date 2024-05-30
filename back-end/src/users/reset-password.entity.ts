
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResetPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column()
  expires: Date;
}
