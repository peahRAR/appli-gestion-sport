// alert.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  async findAll(): Promise<Alert[]> {
    return this.alertRepository.find();
  }

  async findById(id: number): Promise<Alert> {
    return this.alertRepository.findOne({ where: { id } });
  }

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(alert);
  }

  async update(id: number, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new Error('Alert not found');
    }

    Object.assign(alert, updateAlertDto);
    return this.alertRepository.save(alert);
  }

  async delete(id: number): Promise<void> {
    await this.alertRepository.delete(id);
  }

  async deleteExpiredAlerts() {
    try {
      // Récupérer toutes les alertes de la base de données
      const alerts = await this.alertRepository.find();

      // Récupérer la date actuelle
      const currentDate = new Date();

      // Filtrer les alertes expirées
      const expiredAlerts = alerts.filter(
        (alert) => new Date(alert.dateFin) < currentDate,
      );

      // Supprimer les alertes expirées de la base de données
      await Promise.all(
        expiredAlerts.map(async (alert) => {
          await this.alertRepository.remove(alert);
        }),
      );
    } catch (error) {
      // Gérer les erreurs
      console.error('Error deleting expired alerts:', error);
    }
  }
}
