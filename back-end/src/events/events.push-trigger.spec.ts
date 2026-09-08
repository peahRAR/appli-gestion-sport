import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { ListsMembersService } from '../lists-members/lists-members.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

describe('EventsService — déclenchement des notifications push', () => {
  let service: EventsService;
  let eventRepo: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock; update: jest.Mock };
  let pushService: { notifyNewVisibleCourse: jest.Mock };

  beforeEach(async () => {
    eventRepo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    pushService = { notifyNewVisibleCourse: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: eventRepo },
        { provide: ListsMembersService, useValue: {} },
        { provide: PushNotificationsService, useValue: pushService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  // Petit délai pour laisser le .catch() du fire-and-forget se résoudre
  // avant les assertions (notifyNewVisibleCourse est appelé de façon
  // asynchrone sans être attendu par create()/update()).
  const flush = () => new Promise((r) => setImmediate(r));

  it('notifies on creating a visible course', async () => {
    await service.create({ duration: '60', name_event: 'Cours A', isVisible: true } as any);
    await flush();
    expect(pushService.notifyNewVisibleCourse).toHaveBeenCalledWith({ name_event: 'Cours A' });
  });

  it('does not notify on creating a non-visible course', async () => {
    await service.create({ duration: '60', name_event: 'Cours A', isVisible: false } as any);
    await flush();
    expect(pushService.notifyNewVisibleCourse).not.toHaveBeenCalled();
  });

  it('notifies when a course transitions from hidden to visible', async () => {
    eventRepo.findOne
      .mockResolvedValueOnce({ id: 1, isVisible: false, name_event: 'Cours A' }) // before
      .mockResolvedValueOnce({ id: 1, isVisible: true, name_event: 'Cours A' }); // after

    await service.update(1, { isVisible: true } as any);
    await flush();
    expect(pushService.notifyNewVisibleCourse).toHaveBeenCalledWith({ name_event: 'Cours A' });
  });

  it('does not notify when editing an already-visible course', async () => {
    eventRepo.findOne
      .mockResolvedValueOnce({ id: 1, isVisible: true, name_event: 'Cours A' }) // before
      .mockResolvedValueOnce({ id: 1, isVisible: true, name_event: 'Cours A (modifié)' }); // after

    await service.update(1, { name_event: 'Cours A (modifié)' } as any);
    await flush();
    expect(pushService.notifyNewVisibleCourse).not.toHaveBeenCalled();
  });

  it('does not notify when a course stays hidden', async () => {
    eventRepo.findOne
      .mockResolvedValueOnce({ id: 1, isVisible: false, name_event: 'Cours A' })
      .mockResolvedValueOnce({ id: 1, isVisible: false, name_event: 'Cours A' });

    await service.update(1, { name_event: 'Cours A' } as any);
    await flush();
    expect(pushService.notifyNewVisibleCourse).not.toHaveBeenCalled();
  });
});
