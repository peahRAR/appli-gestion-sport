import { Test, TestingModule } from '@nestjs/testing';
import { ListsMembersService } from './lists-members.service';

describe('ListsMembersService', () => {
  let service: ListsMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListsMembersService],
    }).compile();

    service = module.get<ListsMembersService>(ListsMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
