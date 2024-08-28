import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyHolder } from 'src/keyholder/entities/keyholder.entity';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class KeyHolderService {
    constructor(
        @InjectRepository(KeyHolder)
        private readonly keyHolderRepository: Repository<KeyHolder>,
    ) { }

    async assignKey(user: User, keyNumber: number): Promise<KeyHolder> {
        const keyHolder = this.keyHolderRepository.create({ user, keyNumber });
        return this.keyHolderRepository.save(keyHolder);
    }

    async getKeysForUser(userId: string): Promise<KeyHolder[]> {
        return this.keyHolderRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    }

    async removeKey(id: string): Promise<void> {
        await this.keyHolderRepository.delete(id);
    }

    // Nouvelle méthode pour récupérer toutes les clés
    async findAll(): Promise<KeyHolder[]> {
        return this.keyHolderRepository.find({ relations: ['user'] });
    }

    // Nouvelle méthode pour mettre à jour une clé existante
    async updateKey(id: string, user: User): Promise<KeyHolder> {
        const keyHolder = await this.keyHolderRepository.findOne({ where: { id } });
        if (!keyHolder) {
            throw new NotFoundException(`Key with ID ${id} not found`);
        }
        keyHolder.user = user;
        return this.keyHolderRepository.save(keyHolder);
    }
}