import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListsMember } from './lists-member.entity';
import { CreateListsMemberDto } from './dto/create-lists-member.dto';
import { UpdateListsMemberDto } from './dto/update-lists-member.dto';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class ListsMembersService {
  constructor(
    @InjectRepository(ListsMember)
    private readonly listsMemberRepository: Repository<ListsMember>,
    @Inject(EventsService)
    private readonly eventsService: EventsService,
  ) {}

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

  async findOne(
    eventId: number,
    userId: number,
  ): Promise<ListsMember | undefined> {
    return this.listsMemberRepository.findOne({ where: { eventId, userId } });
  }

  async update(
    eventId: number,
    userId: number,
    updateListsMemberDto: UpdateListsMemberDto,
  ): Promise<ListsMember | undefined> {
    
    const response = await this.eventsService.findOne(eventId);
    let places = response.places;

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

  async remove(eventId: number, userId: number): Promise<void> {
    await this.listsMemberRepository.delete({ eventId, userId });
  }
}
