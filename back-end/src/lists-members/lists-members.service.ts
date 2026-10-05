import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, EntityManager, LessThan } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CourseWaitlist } from './course-waitlist.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { EventsService } from 'src/events/events.service';
import { UsersService } from '../users/services/users.service';
import { Event } from 'src/events/events.entity';
import { PushNotificationsService } from 'src/push-notifications/push-notifications.service';

export type UpdateListsMemberResult = {
  isParticipant: boolean;
  waitlistPosition: number | null;
  places: number;
};

@Injectable()
export class ListsMembersService {
  constructor(
    @InjectRepository(ListsMember)
    private readonly listsMemberRepository: Repository<ListsMember>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly dataSource: DataSource, // Injection de DataSource
    private readonly pushNotificationsService: PushNotificationsService,
  ) { }

  async create(createListsMemberDto: CreateListsMemberDto): Promise<ListsMember> {
    const newListsMember = this.listsMemberRepository.create(createListsMemberDto);
    return this.listsMemberRepository.save(newListsMember);
  }

  async findAll(): Promise<ListsMember[]> {
    return this.listsMemberRepository.find();
  }

  async findAllByIdEvent(eventId): Promise<ListsMember[]> {
    return this.listsMemberRepository.find({ where: { eventId } });
  }

  async findAllByIdUser(userId): Promise<ListsMember[]> {
    return this.listsMemberRepository.find({ where: { userId } });
  }

  async findParticipants(eventId: number): Promise<any[]> {
    try {
      const participants = await this.listsMemberRepository.find({
        where: { eventId, isParticipant: true },
        relations: ['user', 'user.licenses', 'user.licenses.federation'],
        select: {
          user: {
            id: true,
            license: true,
            date_end_pay: true,
            avatar: true,
            firstname: true,
            name: true,
            grade: true,
            formation: true,
          }
        }
      });

      // Selected user fields are already decrypted by the @EncryptedColumn transformer.
      // `license` (legacy single-field) can be empty even when a licence
      // exists in the new per-federation system, so also check `licenses`.
      const listParticipants = participants.map(({ user }) => {
        const hasLicense = !!user.license
          || (user.licenses ?? []).some(l => l.federation?.code !== 'LEGACY' && !!l.number_encrypted);
        const hasFmmafLicense = (user.licenses ?? []).some(l => l.federation?.code === 'FMMAF' && !!l.number_encrypted);
        const { licenses, ...rest } = user;
        return { ...rest, hasLicense, hasFmmafLicense };
      });

      return listParticipants;

    } catch (error) {
      console.error('Error finding participants:', error);
      throw new Error('Failed to find participants');
    }
  }

  async findOne(eventId: number, userId: string): Promise<any> {
    const listsMember = await this.listsMemberRepository.findOne({
      where: { eventId, userId },
    });
    const waitlistPosition = await this.getWaitlistPosition(this.dataSource.manager, eventId, userId);
    if (!listsMember) {
      return { waitlistPosition };
    }
    return { ...listsMember, waitlistPosition };
  }

  async update(
    eventId: number,
    userId: string,
    updateListsMemberDto: UpdateListsMemberDto,
  ): Promise<UpdateListsMemberResult> {
    const { promotedUserIds, result } = await this.dataSource.transaction(async em => {
      // Verrou sur l'événement : sérialise les inscriptions, désinscriptions et
      // promotions de la file pour ce cours, pour éviter de dépasser les places.
      const event = await em.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new Error(`Event with id ${eventId} not found`);
      }

      const existingMember = await em.findOne(ListsMember, { where: { eventId, userId } });
      let promotedUserIds: string[] = [];

      if (updateListsMemberDto.isParticipant) {
        const alreadyWaiting = await em.findOne(CourseWaitlist, { where: { eventId, userId } });
        if (!existingMember?.isParticipant && !alreadyWaiting) {
          const participants = await em.count(ListsMember, { where: { eventId, isParticipant: true } });
          const queueLength = await em.count(CourseWaitlist, { where: { eventId } });
          if (participants < event.totalPlaces && queueLength === 0) {
            await this.setParticipant(em, eventId, userId, existingMember);
            this.usersService.touchLastCourseRegistration(userId).catch(() => {});
          } else {
            await em.save(em.create(CourseWaitlist, { eventId, userId }));
          }
        }
      } else {
        await em.delete(CourseWaitlist, { eventId, userId });
        if (!existingMember) {
          await em.save(ListsMember, { eventId, userId, isParticipant: false });
        } else if (existingMember.isParticipant) {
          existingMember.isParticipant = false;
          await em.save(existingMember);
          promotedUserIds = await this.promoteFromWaitlist(em, event);
        }
      }

      const updatedParticipantsCount = await em.count(ListsMember, {
        where: { eventId, isParticipant: true },
      });
      event.places = event.totalPlaces - updatedParticipantsCount;
      await em.save(event);

      const member = await em.findOne(ListsMember, { where: { eventId, userId } });
      const waitlistPosition = await this.getWaitlistPosition(em, eventId, userId);
      return {
        promotedUserIds,
        result: {
          isParticipant: member?.isParticipant ?? false,
          waitlistPosition,
          places: event.places,
        },
      };
    });

    this.notifyPromoted(promotedUserIds);

    return result;
  }

  async applyCapacity(eventId: number, totalPlaces: number): Promise<void> {
    const promotedUserIds = await this.dataSource.transaction(async em => {
      const event = await em.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!event) {
        throw new Error(`Event with id ${eventId} not found`);
      }

      event.totalPlaces = totalPlaces;
      const promoted = await this.promoteFromWaitlist(em, event);

      const participants = await em.count(ListsMember, { where: { eventId, isParticipant: true } });
      event.places = totalPlaces - participants;
      await em.save(event);
      return promoted;
    });

    this.notifyPromoted(promotedUserIds);
  }

  private notifyPromoted(userIds: string[]): void {
    for (const userId of userIds) {
      this.pushNotificationsService.notifyUser(userId, {
        title: 'Une place s\'est libérée',
        body: 'Bonne nouvelle, tu es inscrit au cours depuis la liste d\'attente !',
      }).catch(() => {});
    }
  }

  private async setParticipant(
    em: EntityManager,
    eventId: number,
    userId: string,
    existingMember: ListsMember | null,
  ): Promise<void> {
    if (!existingMember) {
      await em.save(ListsMember, { eventId, userId, isParticipant: true });
      return;
    }
    existingMember.isParticipant = true;
    await em.save(existingMember);
  }

  private async promoteFromWaitlist(em: EntityManager, event: Event): Promise<string[]> {
    const participants = await em.count(ListsMember, { where: { eventId: event.id, isParticipant: true } });
    let freePlaces = event.totalPlaces - participants;
    const promotedUserIds: string[] = [];

    while (freePlaces > 0) {
      const next = await em.findOne(CourseWaitlist, {
        where: { eventId: event.id },
        order: { id: 'ASC' },
      });
      if (!next) break;

      await em.delete(CourseWaitlist, { id: next.id });
      const member = await em.findOne(ListsMember, { where: { eventId: event.id, userId: next.userId } });
      await this.setParticipant(em, event.id, next.userId, member);
      promotedUserIds.push(next.userId);
      freePlaces--;
    }

    return promotedUserIds;
  }

  private async getWaitlistPosition(
    em: EntityManager,
    eventId: number,
    userId: string,
  ): Promise<number | null> {
    const entry = await em.findOne(CourseWaitlist, { where: { eventId, userId } });
    if (!entry) return null;
    const ahead = await em.count(CourseWaitlist, { where: { eventId, id: LessThan(entry.id) } });
    return ahead + 1;
  }

  async remove(eventId: number, userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ eventId, userId });
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ userId });
  }

  async removeAllByEventIds(eventIds: number[]): Promise<void> {
    if (eventIds.length === 0) return;
    await this.listsMemberRepository.delete({ eventId: In(eventIds) });
  }
}
