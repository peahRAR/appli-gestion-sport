import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/users.entity';

@Entity()
export class Badge {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    badgeNumber: number;  // Identifiant du badge ou numéro du badge

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    assignedDate: Date;  // Date d'attribution du badge

    @ManyToOne(() => User, user => user.badges)
    user: User;
}
