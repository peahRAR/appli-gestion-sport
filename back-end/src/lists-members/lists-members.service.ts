import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { EventsService } from 'src/events/events.service';
import { UsersService } from '../users/services/users.service';
import { EncryptionService } from 'src/users/services/encryption.service';
import { Event } from 'src/events/events.entity';

@Injectable()
export class ListsMembersService {
  constructor(
    @InjectRepository(ListsMember)
    private readonly listsMemberRepository: Repository<ListsMember>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly encryptionService: EncryptionService,
    private readonly dataSource: DataSource, // Injection de DataSource
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
        relations: ['user'],
        select: {
          user: {
            id: true,
            license: {
              identifier: true,
              data: true
            },
            date_end_pay: {
              identifier: true,
              data: true
            },
            avatar: {
              identifier: true,
              data: true
            },
            firstname: {
              identifier: true,
              data: true
            },
            name: {
              identifier: true,
              data: true
            },
          }
        }
      });

      const listParticipants = participants.map(participant => participant.user);

      const decryptFields = async (user) => {
        for (const key in user) {
          if (user[key] && typeof user[key] === 'object' && 'identifier' in user[key] && 'data' in user[key]) {
            try {
              user[key] = await this.encryptionService.decryptField(user[key]);
            } catch (error) {
              console.error(`Failed to decrypt ${key} for user ${user.id}:`, error);
            }
          }
        }
      };

      // Décryptage des champs pour chaque utilisateur
      for (const user of listParticipants) {
        await decryptFields(user);
      }

      console.log(listParticipants);

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
    if (!listsMember) {
      return {}; // Ou return { error: 'Aucune correspondance trouvée' };
    }
    return listsMember;
  }

  async update(
    eventId: number,
    userId: string,
    updateListsMemberDto: UpdateListsMemberDto,
  ): Promise<ListsMember | undefined> {
    console.log(`Transaction started for eventId: ${eventId}, userId: ${userId}`);

    return this.dataSource.transaction(async transactionalEntityManager => {
      console.log(`Transaction in progress for eventId: ${eventId}, userId: ${userId}`);

      // Récupérer les informations de l'événement
      const event = await transactionalEntityManager.findOne(Event, {
        where: { id: eventId }
      });

      if (!event) {
        throw new Error(`Event with id ${eventId} not found`);
      }

      let places = event.places;
      const totalPlaces = event.totalPlaces;

      // Récupérer le nombre de participants déjà inscrits
      const participants = await transactionalEntityManager.count(ListsMember, {
        where: { eventId, isParticipant: true },
      });

      // Loguer le nombre de places et de participants
      console.log(`Event ${eventId}: ${places} places restante sur ${totalPlaces}, ${participants} participants déjà enregistrés.`);

      // Vérification de la cohérence entre les places et les participants
      if (participants >= totalPlaces) {
        console.log(`No more places available for eventId: ${eventId}`);
        throw new Error("Désolé, il n'y a plus de place pour ce cours");
      }

      console.log('updateListsMemberDto:', updateListsMemberDto);

      // Récupérer l'entrée de la liste des membres correspondant à l'utilisateur et à l'événement
      const existingMember = await transactionalEntityManager.findOne(ListsMember, {
        where: { eventId, userId },
        lock: { mode: 'pessimistic_write' }, // Verrouillage pessimiste
      });

      // Si l'utilisateur est déjà inscrit avec le même statut de participation
      if (existingMember && existingMember.isParticipant === updateListsMemberDto.isParticipant) {
        console.log(`No change in participation status for userId: ${userId}, eventId: ${eventId}`);
        return existingMember; // Aucune action nécessaire si l'état de participation est le même
      }

      // Cas où l'utilisateur se désinscrit ou devient non-participant
      if (updateListsMemberDto.isParticipant === false) {
        if (!existingMember) {
          // Créer une nouvelle entrée pour un utilisateur non participant
          console.log(`Creating non-participant entry for userId: ${userId}, eventId: ${eventId}`);
          await transactionalEntityManager.save(ListsMember, {
            eventId,
            userId,
            isParticipant: false,
          });
        } else {
          // Mettre à jour l'état de participation à "non-participant"
          console.log(`Updating to non-participant for userId: ${userId}, eventId: ${eventId}`);
          existingMember.isParticipant = false;
          await transactionalEntityManager.save(existingMember);
          places++;
        }
      } else {
        // Cas où l'utilisateur devient participant
        if (!existingMember) {
          // Créer une nouvelle entrée pour un participant
          console.log(`Creating participant entry for userId: ${userId}, eventId: ${eventId}`);
          await transactionalEntityManager.save(ListsMember, {
            eventId,
            userId,
            isParticipant: true,
          });
          places--;
        } else {
          // Mettre à jour l'état de participation à "participant"
          console.log(`Updating to participant for userId: ${userId}, eventId: ${eventId}`);
          existingMember.isParticipant = true;
          await transactionalEntityManager.save(existingMember);
          places--;
        }
      }

      // Mettre à jour le nombre de places restantes pour l'événement
      event.places = places;
      await transactionalEntityManager.save(event);

      console.log(`Transaction committed for eventId: ${eventId}, userId: ${userId}`);
      return transactionalEntityManager.findOne(ListsMember, { where: { eventId, userId } });
    })
      .catch(error => {
        console.log(`Transaction failed for eventId: ${eventId}, userId: ${userId}`, error);
        throw error;
      });
  }

  async remove(eventId: number, userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ eventId, userId });
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ userId });
  }
}
