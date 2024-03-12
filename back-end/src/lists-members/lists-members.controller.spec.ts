import { Test, TestingModule } from '@nestjs/testing';
import { ListsMembersController } from './lists-members.controller';
import { ListsMembersService } from './lists-members.service';

describe('ListsMembersController', () => {
  let controller: ListsMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsMembersController],
      providers: [ListsMembersService],
    }).compile();

    controller = module.get<ListsMembersController>(ListsMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
