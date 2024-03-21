import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Repository } from 'typeorm';
import { Event } from './events.entity';


@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const newEvent = this.eventRepository.create(createEventDto);
    await this.eventRepository.save(newEvent);
    return newEvent;
  }
  

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  async findOne(id: number): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id } });
  }

  async update(id: number, updateeventDto: UpdateEventDto): Promise<Event | undefined> {
    await this.eventRepository.update(id, updateeventDto);
    return this.eventRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.eventRepository.delete(id);
  }

  async deleteExpiredEvents(): Promise<void> {
    // Date d'expiration = aujourd'hui - 1 jour
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 1);
    
    // Supprimer les événements dont la date est inférieure à la date d'expiration
    await this.eventRepository
      .createQueryBuilder()
      .delete()
      .where('date_event < :expirationDate', { expirationDate })
      .execute();
  }
}
