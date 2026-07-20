import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Badge } from './entities/badge.entity';
import { BadgeService } from './services/badge.service';
import { BadgeController } from './controllers/badge.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Badge]),
        forwardRef(() => UsersModule),  // Utilisation de forwardRef pour éviter la dépendance circulaire
    ],
    providers: [BadgeService],
    controllers: [BadgeController],
    exports: [BadgeService],
})
export class BadgesModule { }
