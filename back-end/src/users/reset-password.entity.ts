
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResetPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  token: string;

  @Column()
  expires: Date;
}
