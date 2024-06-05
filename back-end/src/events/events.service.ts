import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Repository, FindManyOptions } from 'typeorm';
import { Event } from './events.entity';
import { ListsMembersService } from 'src/lists-members/lists-members.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @Inject(forwardRef(() => ListsMembersService))
    private listsMembersService: ListsMembersService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Convertir la durée de chaîne de caractères en entier
    const durationInMinutes = parseInt(createEventDto.duration, 10);

    if (isNaN(durationInMinutes)) {
      throw new Error('Invalid duration format');
    }

    // Convertir la durée en intervalle PostgreSQL
    const durationInterval = `PT${durationInMinutes}M`;

    const newEvent = this.eventRepository.create({
      ...createEventDto,
      duration: durationInterval, // Enregistrer la durée en tant qu'intervalle
    });

    await this.eventRepository.save(newEvent);
    return newEvent;
  }

  async findAll(): Promise<Event[]> {
    const options: FindManyOptions<Event> = {
      order: {
        date_event: 'ASC',
      },
    };

    return this.eventRepository.find(options);
  }

  async findOne(id: number): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateeventDto: UpdateEventDto,
  ): Promise<Event | undefined> {
    await this.eventRepository.update(id, updateeventDto);
    return this.eventRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.eventRepository.remove(event);
  }

  async deleteExpiredEvents(): Promise<void> {
    // Date d'expiration = aujourd'hui - 1 jour
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 1);

    // Récupérer les IDs des événements expirés
    const expiredEvents = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.id')
      .where('event.date_event < :expirationDate', { expirationDate })
      .getMany();

    // Supprimer les entrées correspondantes dans la table ListsMembers
    for (const event of expiredEvents) {
      const lists = await this.listsMembersService.findAllByIdEvent(event.id);
      lists.forEach((element) => {
        this.listsMembersService.remove(element.eventId, element.userId);
      });
    }

    // Supprimer les événements expirés de la table Events
    await this.eventRepository
      .createQueryBuilder()
      .delete()
      .where('date_event < :expirationDate', { expirationDate })
      .execute();
  }
}
