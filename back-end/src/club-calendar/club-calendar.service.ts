import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ClubCalendarEvent } from './club-calendar.entity';
import { CreateClubCalendarEventDto } from './dto/create-club-calendar-event.dto';
import { UpdateClubCalendarEventDto } from './dto/update-club-calendar-event.dto';

@Injectable()
export class ClubCalendarService {
    private readonly logger = new Logger(ClubCalendarService.name)
    constructor(
        @InjectRepository(ClubCalendarEvent)
        private readonly repo: Repository<ClubCalendarEvent>,
    ) { }

    async create(dto: CreateClubCalendarEventDto): Promise<ClubCalendarEvent> {
        const entity = this.repo.create({
            title: dto.title,
            type: dto.type,
            forWho: dto.forWho,
            startDate: dto.startDate,
            startTime: dto.startTime ?? null,
            endDate: dto.endDate ?? null,
            endTime: dto.endTime ?? null,
            location: dto.location,
            description: dto.description ?? null,
        });

        return this.repo.save(entity);
    }

    /**
     * Public: tout renvoyer (tu peux filtrer plus tard si besoin).
     * Tri : startDate ASC puis startTime ASC (NULLS LAST)
     */
    async findAll(): Promise<ClubCalendarEvent[]> {
        return this.repo
            .createQueryBuilder('e')
            .orderBy('e.startDate', 'ASC')
            .addOrderBy('e.startTime', 'ASC', 'NULLS LAST')
            .getMany();
    }

    /**
     * Admin: pareil aujourd’hui, séparé si tu veux ajouter des filtres ensuite
     */
    async findAllAdmin(): Promise<ClubCalendarEvent[]> {
        return this.findAll();
    }

    async findOne(id: number): Promise<ClubCalendarEvent | null> {
        return this.repo.findOne({ where: { id } });
    }

    async update(id: number, dto: UpdateClubCalendarEventDto): Promise<ClubCalendarEvent> {
        const existing = await this.findOne(id);
        if (!existing) throw new NotFoundException('ClubCalendarEvent not found');

        const patch: DeepPartial<ClubCalendarEvent> = {};

        if (dto.title !== undefined) patch.title = dto.title;
        if (dto.type !== undefined) patch.type = dto.type;
        if (dto.forWho !== undefined) patch.forWho = dto.forWho;

        if (dto.startDate !== undefined) patch.startDate = dto.startDate;
        if (dto.startTime !== undefined) patch.startTime = dto.startTime ?? null;

        if (dto.endDate !== undefined) patch.endDate = dto.endDate ?? null;
        if (dto.endTime !== undefined) patch.endTime = dto.endTime ?? null;

        if (dto.location !== undefined) patch.location = dto.location;
        if (dto.description !== undefined) patch.description = dto.description ?? null;

        await this.repo.update(id, patch);

        const updated = await this.findOne(id);
        if (!updated) throw new NotFoundException('ClubCalendarEvent not found');
        return updated;
    }

    async remove(id: number): Promise<void> {
        const existing = await this.findOne(id);
        if (!existing) throw new NotFoundException('ClubCalendarEvent not found');
        await this.repo.remove(existing);
    }

    async deleteExpiredClubCalendarEvents(graceHours = 4): Promise<void> {
        const expirationDate = new Date()
        expirationDate.setHours(expirationDate.getHours() - graceHours)

        this.logger.debug(
            `Suppression calendar expirés. Seuil (now - ${graceHours}h): ${expirationDate.toISOString()}`
        )

        const result = await this.repo
            .createQueryBuilder("e")
            .delete()
            .where(
                `
        (
          CASE
            WHEN e."endDate" IS NOT NULL THEN
              (e."endDate" + COALESCE(e."endTime", '23:59:59'::time))
            ELSE
              (e."startDate" + COALESCE(e."startTime", '23:59:59'::time))
          END
        ) < :expirationDate
        `,
                { expirationDate },
            )
            .execute()

        this.logger.debug(`Rows deleted: ${result.affected ?? 0}`)
    }
}