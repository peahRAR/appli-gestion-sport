import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserLicense } from "../users/entities/user-license.entity";

@Entity()
export class Federation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 32 })
  code: string; // 'FSGT', 'FMMAF', etc.

  @Column({ length: 255 })
  name: string;

  @OneToMany(() => UserLicense, lic => lic.federation)
  licenses: UserLicense[];
}
