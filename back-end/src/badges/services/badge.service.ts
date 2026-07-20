import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from 'src/badges/entities/badge.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class BadgeService {
    constructor(
        @InjectRepository(Badge)
        private readonly badgeRepository: Repository<Badge>,
    ) { }

    async assignBadge(user: User, badgeNumber: number): Promise<Badge> {
        const badge = this.badgeRepository.create({ user, badgeNumber });
        return this.badgeRepository.save(badge);
    }

    async getBadgesForUser(userId: string): Promise<Badge[]> {
        return this.badgeRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    }

    async removeBadge(id: string): Promise<void> {
        await this.badgeRepository.delete(id);
    }

    async findAll(): Promise<Badge[]> {
        return this.badgeRepository.find({ relations: ['user'] });
    }

    async updateBadge(id: string, user: User): Promise<Badge> {
        const badge = await this.badgeRepository.findOne({ where: { id } });
        if (!badge) {
            throw new NotFoundException(`Badge with ID ${id} not found`);
        }
        badge.user = user;
        return this.badgeRepository.save(badge);
    }
}
