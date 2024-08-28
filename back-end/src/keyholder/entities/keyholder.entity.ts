import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';

@Entity()
export class KeyHolder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    keyNumber: number;  // Identifiant de la clé ou numéro de la clé

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    assignedDate: Date;  // Date d'attribution de la clé

    @ManyToOne(() => User, user => user.keys)
    user: User;
}
