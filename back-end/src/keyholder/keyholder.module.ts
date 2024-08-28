import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { KeyHolder } from './entities/keyholder.entity';
import { KeyHolderService } from './services/keyholder.service';
import { KeyHolderController } from './controllers/keyholder.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([KeyHolder]),
        forwardRef(() => UsersModule),  // Utilisation de forwardRef pour éviter la dépendance circulaire
    ],
    providers: [KeyHolderService],
    controllers: [KeyHolderController],
    exports: [KeyHolderService],
})
export class KeyHolderModule { }
