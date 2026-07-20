import { Controller, Post, Param, Body, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { KeyHolderService } from '../services/keyholder.service';
import { UsersService } from 'src/users/services/users.service';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';

@Controller('keys')
@UseGuards(AdminRoleGuard)
export class KeyHolderController {
    constructor(
        private readonly keyHolderService: KeyHolderService,
        private readonly userService: UsersService,
    ) { }

    onModuleInit() {
        console.log('KeyHolderController has been initialized');
    }

    // Méthode pour assigner une clé à un utilisateur
    @Post()
    async createKey(
        @Body('userId') userId: string,
        @Body('keyNumber') keyNumber: number,
    ) {
        const user = await this.userService.findOne(userId);
        return this.keyHolderService.assignKey(user, keyNumber);
    }

    // Méthode pour récupérer toutes les clés
    @Get()
    async findAll() {
        console.log('KeyHolderController: Handling GET /keys request');
        return this.keyHolderService.findAll();
    }

    // Méthode pour mettre à jour une clé existante
    @Patch(':id')
    async updateKey(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        const user = await this.userService.findOne(userId);
        return this.keyHolderService.updateKey(id, user);
    }

    // Méthode pour supprimer une clé
    @Delete('remove/:id')
    async removeKey(@Param('id') id: string) {
        return this.keyHolderService.removeKey(id);
    }
}
