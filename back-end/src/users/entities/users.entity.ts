import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ListsMember } from 'src/lists-members/lists-member.entity';
import { KeyHolder } from 'src/keyholder/entities/keyholder.entity';
import { Badge } from 'src/badges/entities/badge.entity';
import { UserLicense } from './user-license.entity';
import { EncryptedColumn } from 'src/common/decorators/encrypted-column.decorator';
import { DEFAULT_FORMATION, DEFAULT_GRADE, Formation, Grade } from '../constants/fmmaf';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @EncryptedColumn({ isEmail: true })
  email: string;

  @EncryptedColumn()
  firstname: string;

  @EncryptedColumn()
  name: string;

  @Column()
  password: string;

  @EncryptedColumn()
  birthday: string;

  @Column({ type: 'boolean' })
  gender: boolean;

  @EncryptedColumn({ nullable: true })
  tel_num: string;

  @EncryptedColumn({ nullable: true })
  tel_medic: string;

  @EncryptedColumn({ nullable: true })
  tel_emergency: string;

  @EncryptedColumn({ nullable: true })
  weight: string;

  @EncryptedColumn({ nullable: true })
  license: string;

  @EncryptedColumn({ nullable: true })
  date_subscribe: string;

  @EncryptedColumn({ nullable: true })
  date_payment: string;

  @EncryptedColumn({ nullable: true })
  date_end_pay: string;

  @EncryptedColumn({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  role: number;

  @Column({ type: 'boolean', default: false })
  approove_rules: boolean;

  // N'ont de sens que pour un licencié FMMAF (voir hasFmmafLicense) ; visibles
  // et éditables uniquement par un administrateur (voir Lot 3).
  @Column({ type: 'varchar', length: 10, default: DEFAULT_GRADE })
  grade: Grade;

  @Column({ type: 'varchar', length: 20, default: DEFAULT_FORMATION })
  formation: Formation;

  // Suivi d'activité — indépendant de `isActive` (qui gère l'activation
  // initiale du compte, pas l'inactivité). Voir CronjobsService pour la
  // désactivation automatique.
  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_course_registration_at: Date | null;

  // 'active' | 'deactivated_inactivity'
  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deactivation_reason: string | null;

  @OneToMany(() => ListsMember, listsMember => listsMember.user, { cascade: ['remove'] })
  listsMembers: ListsMember[];

  @OneToMany(() => UserLicense, lic => lic.user, { cascade: ['remove'] })
  licenses: UserLicense[];

  @OneToMany(() => KeyHolder, keyHolder => keyHolder.user)
  keys: KeyHolder[];

  @OneToMany(() => Badge, badge => badge.user)
  badges: Badge[];
}
