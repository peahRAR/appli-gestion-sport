import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Federation } from "../../federations/federations.entity";
import { User } from "./users.entity";

@Entity()
@Unique(['user', 'federation'])
export class UserLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.licenses, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Federation, f => f.licenses, { eager: true, onDelete: 'RESTRICT' })
  federation: Federation;

  // On conserve ton format chiffré (tu réutilises ton service de chiffrement)
  @Column('json')
  number_encrypted: { identifier: string; data: string };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  valid_from?: string;

  @Column({ type: 'date', nullable: true })
  valid_to?: string;
}
