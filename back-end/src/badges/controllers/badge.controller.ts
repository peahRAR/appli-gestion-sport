import { Controller, Post, Param, Body, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { BadgeService } from '../services/badge.service';
import { UsersService } from 'src/users/services/users.service';
import { AdminRoleGuard } from 'src/common/guard/admin.guard';

@Controller('badges')
@UseGuards(AdminRoleGuard)
export class BadgeController {
    constructor(
        private readonly badgeService: BadgeService,
        private readonly userService: UsersService,
    ) { }

    // Méthode pour assigner un badge à un utilisateur
    @Post()
    async createBadge(
        @Body('userId') userId: string,
        @Body('badgeNumber') badgeNumber: number,
    ) {
        const user = await this.userService.findOne(userId);
        return this.badgeService.assignBadge(user, badgeNumber);
    }

    // Méthode pour récupérer tous les badges
    @Get()
    async findAll() {
        return this.badgeService.findAll();
    }

    // Méthode pour mettre à jour un badge existant
    @Patch(':id')
    async updateBadge(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        const user = await this.userService.findOne(userId);
        return this.badgeService.updateBadge(id, user);
    }

    // Méthode pour supprimer un badge
    @Delete('remove/:id')
    async removeBadge(@Param('id') id: string) {
        return this.badgeService.removeBadge(id);
    }
}
