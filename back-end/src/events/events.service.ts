import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Repository, FindManyOptions, DeepPartial } from 'typeorm';
import { Event } from './events.entity';
import { ListsMembersService } from 'src/lists-members/lists-members.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @Inject(forwardRef(() => ListsMembersService))
    private listsMembersService: ListsMembersService,
  ) { }

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
    updateEventDto: UpdateEventDto,
  ): Promise<Event | undefined> {
    // Créer un objet vide qui sera compatible avec l'entité Event
    const updatedEvent: DeepPartial<Event> = {};

    // Copier manuellement chaque propriété du DTO dans l'objet updatedEvent
    if (updateEventDto.date_event) {
      updatedEvent.date_event = updateEventDto.date_event;
    }
    if (updateEventDto.places) {
      updatedEvent.places = updateEventDto.places;
    }
    if (updateEventDto.name_event) {
      updatedEvent.name_event = updateEventDto.name_event;
    }
    if (updateEventDto.coach) {
      updatedEvent.coach = updateEventDto.coach;
    }
    if (updateEventDto.overview) {
      updatedEvent.overview = updateEventDto.overview;
    }

    // Vérifier si la durée est fournie et contient des heures ou des minutes
    if (updateEventDto.duration && (updateEventDto.duration.hours || updateEventDto.duration.minutes)) {
      const hours = updateEventDto.duration.hours || 0; // Prendre 0 si non défini
      const minutes = updateEventDto.duration.minutes || 0; // Prendre 0 si non défini

      // Convertir tout en minutes
      const totalDurationInMinutes = (hours * 60) + minutes;

      // Vérifier si la durée totale est valide
      if (isNaN(totalDurationInMinutes) || totalDurationInMinutes <= 0) {
        throw new Error('Invalid duration format');
      }

      // Convertir la durée en intervalle PostgreSQL (ISO 8601 format)
      const durationInterval = `PT${totalDurationInMinutes}M`;

      // Mettre à jour la durée avec le format string attendu
      updatedEvent.duration = durationInterval;
    }

    // Mettre à jour l'événement dans la base de données
    await this.eventRepository.update(id, updatedEvent);

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