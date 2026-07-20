import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Federation } from "../../federations/federations.entity";
import { User } from "./users.entity";
import { EncryptedColumn } from "../../common/decorators/encrypted-column.decorator";

@Entity()
@Unique(['user', 'federation'])
export class UserLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.licenses, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Federation, f => f.licenses, { eager: true, onDelete: 'RESTRICT' })
  federation: Federation;

  // Encrypted at rest (same AES-256-CBC scheme as before); holds the plain
  // license number in memory once TypeORM's transformer decrypts it.
  @EncryptedColumn()
  number_encrypted: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  valid_from?: string;

  @Column({ type: 'date', nullable: true })
  valid_to?: string;
}
