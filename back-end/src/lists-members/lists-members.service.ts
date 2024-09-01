import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { EventsService } from 'src/events/events.service';
import { UsersService } from '../users/services/users.service';
import { EncryptionService } from 'src/users/services/encryption.service';

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

    return this.dataSource.transaction(async manager => {
      console.log(`Transaction in progress for eventId: ${eventId}, userId: ${userId}`);

      const response = await this.eventsService.findOne(eventId);
      let places = response.places;

      // Vérifier si l'utilisateur souhaite s'inscrire et s'il reste des places disponibles
      if (updateListsMemberDto.isParticipant && places <= 0) {
        console.log(`No more places available for eventId: ${eventId}`);
        throw new Error("Désolé, il n'y a plus de place pour ce cours");
      }

      // Récupérer l'entrée de la liste des membres correspondant à l'utilisateur et à l'événement
      const fetchBdd = await manager.findOne(ListsMember, {
        where: { eventId, userId },
        lock: { mode: 'pessimistic_write' }, // Verrouillage pessimiste
      });

      // Vérifier si l'utilisateur est déjà inscrit à l'événement
      const isAlreadyParticipant = fetchBdd && fetchBdd.isParticipant;

      if (updateListsMemberDto.isParticipant === isAlreadyParticipant) {
        console.log(`No change in participation status for userId: ${userId}, eventId: ${eventId}`);
        return; // Aucune action nécessaire si l'état de participation est le même
      }

      if (updateListsMemberDto.isParticipant === false) {
        if (!fetchBdd) {
          console.log(`Creating non-participant entry for userId: ${userId}, eventId: ${eventId}`);
          await manager.save(ListsMember, {
            eventId,
            userId,
            isParticipant: false,
          });
        } else {
          console.log(`Updating to non-participant for userId: ${userId}, eventId: ${eventId}`);
          await manager.update(
            ListsMember,
            { eventId, userId },
            updateListsMemberDto,
          );
          places++;
        }
      } else {
        if (!fetchBdd) {
          console.log(`Creating participant entry for userId: ${userId}, eventId: ${eventId}`);
          await manager.save(ListsMember, {
            eventId,
            userId,
            isParticipant: true,
          });
          places--;
        } else {
          console.log(`Updating to participant for userId: ${userId}, eventId: ${eventId}`);
          await manager.update(
            ListsMember,
            { eventId, userId },
            updateListsMemberDto,
          );
          places--;
        }
      }

      // Mettre à jour le nombre de places restantes pour l'événement
      const placesRest = { places };
      await this.eventsService.update(eventId, placesRest);

      console.log(`Transaction committed for eventId: ${eventId}, userId: ${userId}`);
      return manager.findOne(ListsMember, { where: { eventId, userId } });
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
