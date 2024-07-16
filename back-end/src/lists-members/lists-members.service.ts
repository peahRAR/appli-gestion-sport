import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { EventsService } from 'src/events/events.service';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class ListsMembersService {
  constructor(
    @InjectRepository(ListsMember)
    private readonly listsMemberRepository: Repository<ListsMember>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) { }

  async create(
    createListsMemberDto: CreateListsMemberDto,
  ): Promise<ListsMember> {
    const newListsMember =
      this.listsMemberRepository.create(createListsMemberDto);
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
      //TODO externaliser les methode de crypte et decrypte puis les utiliser pour decrypté les champs 
      console.log(listParticipants)

      return null

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
      // Si aucune correspondance n'est trouvée, retourner un objet JSON vide ou un message d'erreur
      return {}; // Ou return { error: 'Aucune correspondance trouvée' };
    }
    return listsMember;
  }

  async update(
    eventId: number,
    userId: string,
    updateListsMemberDto: UpdateListsMemberDto,
  ): Promise<ListsMember | undefined> {
    const response = await this.eventsService.findOne(eventId);
    let places = response.places;

    // Vérifier si l'utilisateur souhaite s'inscrire et s'il reste des places disponibles
    if (updateListsMemberDto.isParticipant && places <= 0) {
      throw new Error("Désolé, il n'y a plus de place pour ce cours");
    }

    // Récupérer l'entrée de la liste des membres correspondant à l'utilisateur et à l'événement
    const fetchBdd = await this.listsMemberRepository.findOne({
      where: { eventId, userId },
    });

    // Vérifier si l'utilisateur est déjà inscrit à l'événement
    const isAlreadyParticipant = fetchBdd && fetchBdd.isParticipant;

    // Mettre à jour la liste des membres et le nombre de places en fonction de l'état de participation
    if (updateListsMemberDto.isParticipant === isAlreadyParticipant) {
      return; // Aucune action nécessaire si l'état de participation est le même
    }

    // Mettre à jour la liste des membres et le nombre de places en fonction de l'état de participation
    if (updateListsMemberDto.isParticipant === false) {
      if (!fetchBdd) {
        this.create({ eventId, userId, isParticipant: false });
      } else {
        await this.listsMemberRepository.update(
          { eventId, userId },
          updateListsMemberDto,
        );
        places++;
      }
    } else {
      if (!fetchBdd) {
        this.create({ eventId, userId, isParticipant: true });
        places--;
      } else {
        await this.listsMemberRepository.update(
          { eventId, userId },
          updateListsMemberDto,
        );
        places--;
      }
    }
    // Mettre à jour le nombre de places restantes pour l'événement
    const placesRest = { places };
    this.eventsService.update(eventId, placesRest);
    return this.listsMemberRepository.findOne({ where: { eventId, userId } });
  }

  async remove(eventId: number, userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ eventId, userId });
  }

  async removeAllByUserId(userId: string): Promise<void> {
    await this.listsMemberRepository.delete({ userId });
  }
}
