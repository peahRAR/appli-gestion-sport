import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Federation } from './federations.entity';

@Injectable()
export class AdminFederationsService {
  constructor(
    @InjectRepository(Federation)
    private readonly fedRepo: Repository<Federation>,
  ) {}

  async create(code: string, name: string) {
    code = code.trim().toUpperCase();
    name = name.trim();
    if (!code || !name) throw new BadRequestException('Code et nom requis');

    const exists = await this.fedRepo.findOne({ where: { code } });
    if (exists) throw new BadRequestException('Ce code existe déjà');

    const fed = this.fedRepo.create({ code, name });
    return this.fedRepo.save(fed);
  }

  async updateName(id: string, name: string) {
    const fed = await this.fedRepo.findOne({ where: { id } });
    if (!fed) throw new NotFoundException('Fédération introuvable');
    fed.name = (name ?? '').trim();
    if (!fed.name) throw new BadRequestException('Nom requis');
    return this.fedRepo.save(fed);
  }

  async remove(id: string) {
    const fed = await this.fedRepo.findOne({ where: { id } });
    if (!fed) throw new NotFoundException('Fédération introuvable');
    try {
      await this.fedRepo.remove(fed);
      return { success: true };
    } catch (e: any) {
      // Contrainte FK (licences rattachées) -> code Postgres 23503
      if (e.code === '23503') {
        throw new BadRequestException('Impossible de supprimer : des licences y sont rattachées');
      }
      throw e;
    }
  }
}
