import { Inject, Injectable, NotFoundException, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Repository, FindManyOptions, DeepPartial } from 'typeorm';
import { Event } from './events.entity';
import { ListsMembersService } from 'src/lists-members/lists-members.service';


@Injectable()
export class EventsService {

  private readonly logger = new Logger(EventsService.name);

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
      duration: durationInterval,
      isVisible: createEventDto.isVisible ?? true
    });

    await this.eventRepository.save(newEvent);
    return newEvent;
  }

  async findAll(options?: { visible?: boolean }): Promise<Event[]> {
    const where: any = {};
    if (options?.visible === true || options?.visible === false) {
      where.isVisible = options.visible;
    }

    return this.eventRepository.find({
      where,
      order: { date_event: 'ASC' },
    });
  }

  async findAllVisible(): Promise<Event[]> {
    return this.eventRepository.find({ where: { isVisible: true }, order: { date_event: 'ASC' } });
  }

  async findOne(id: number): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id } });
  }

  // events.service.ts (extrait)
  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event | undefined> {
    const updatedEvent: DeepPartial<Event> = {};

    if (updateEventDto.date_event) updatedEvent.date_event = updateEventDto.date_event;
    if (updateEventDto.places) updatedEvent.places = updateEventDto.places;
    if (updateEventDto.name_event) updatedEvent.name_event = updateEventDto.name_event;
    if (updateEventDto.coach) updatedEvent.coach = updateEventDto.coach;
    if (updateEventDto.overview) updatedEvent.overview = updateEventDto.overview;

    // --- visibilité: accepte camelCase et snake_case
    const anyDto = updateEventDto as any;
    if (typeof anyDto.isVisible === 'boolean') updatedEvent.isVisible = anyDto.isVisible;
    else if (typeof anyDto.is_visible === 'boolean') updatedEvent.isVisible = anyDto.is_visible;

    // --- durée: rendre le parsing tolérant
    if (anyDto.duration !== undefined) {
      if (typeof anyDto.duration === 'string') {
        const s = anyDto.duration.trim();
        if (s === '') {
          // ignore
        } else if (/^PT(\d+H(\d+M)?)|^PT(\d+M)$/i.test(s)) {
          updatedEvent.duration = s.toUpperCase();
        } else {
          const minutes = Number(s);
          if (Number.isFinite(minutes) && minutes > 0) {
            updatedEvent.duration = `PT${minutes}M`;
          } else {
            this.logger.warn(`Duration ignorée (format invalide): "${s}" pour event #${id}`);
          }
        }
      } else if (typeof anyDto.duration === 'object' && anyDto.duration !== null) {
        const hours = Number(anyDto.duration.hours || 0);
        const minutes = Number(anyDto.duration.minutes || 0);
        const total = hours * 60 + minutes;
        if (Number.isFinite(total) && total > 0) {
          updatedEvent.duration = `PT${total}M`;
        } else {
          this.logger.warn(`Duration ignorée (objet invalide) pour event #${id}`);
        }
      }
    }

    await this.eventRepository.update(id, updatedEvent);
    return this.eventRepository.findOne({ where: { id } });
  }


  async updateVisibility(id: number, visible: boolean): Promise<Event | undefined> {
    await this.eventRepository.update(id, { isVisible: visible });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    await this.eventRepository.remove(event);
  }

  async deleteExpiredEvents(): Promise<void> {
    this.logger.debug('Début de la suppression des événements expirés');

    // Date d'expiration = aujourd'hui - 4 heures
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 4);
    this.logger.debug(`Date d'expiration calculée : ${expirationDate}`);

    // Récupérer les IDs des événements expirés
    const expiredEvents = await this.eventRepository
      .createQueryBuilder('event')
      .select('event.id')
      .where('event.date_event < :expirationDate', { expirationDate })
      .getMany();

    this.logger.debug(`Événements expirés récupérés : ${JSON.stringify(expiredEvents)}`);

    // Supprimer les entrées correspondantes dans la table ListsMembers
    for (const event of expiredEvents) {
      this.logger.debug(`Traitement de l'événement : ${event.id}`);
      const lists = await this.listsMembersService.findAllByIdEvent(event.id);
      this.logger.debug(`Membres trouvés pour l'événement : ${JSON.stringify(lists)}`);

      for (const element of lists) {
        this.logger.debug(`Suppression du membre : eventId=${element.eventId}, userId=${element.userId}`);
        await this.listsMembersService.remove(element.eventId, element.userId);
      }
    }

    // Supprimer les événements expirés de la table Events
    this.logger.debug('Suppression des événements de la table Events');
    await this.eventRepository
      .createQueryBuilder()
      .delete()
      .where('date_event < :expirationDate', { expirationDate })
      .execute();

    this.logger.debug('Fin de la suppression des événements expirés');
  }

}