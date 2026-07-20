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

  @OneToMany(() => ListsMember, listsMember => listsMember.user, { cascade: ['remove'] })
  listsMembers: ListsMember[];

  @OneToMany(() => UserLicense, lic => lic.user, { cascade: ['remove'] })
  licenses: UserLicense[];

  @OneToMany(() => KeyHolder, keyHolder => keyHolder.user)
  keys: KeyHolder[];

  @OneToMany(() => Badge, badge => badge.user)
  badges: Badge[];
}
