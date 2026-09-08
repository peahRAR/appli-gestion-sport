import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from '../entities/users.entity';
import { ResetPassword } from '../entities/reset-password.entity';
import { UserLicense } from '../entities/user-license.entity';
import { Federation } from '../../federations/federations.entity';
import { ListsMembersService } from '../../lists-members/lists-members.service';
import { EncryptionService } from './encryption.service';
import { EmailService } from './email.service';

function fakeQueryBuilder(affected: number) {
  const qb: any = {};
  ['update', 'set', 'where', 'andWhere'].forEach((m) => {
    qb[m] = jest.fn().mockReturnValue(qb);
  });
  qb.execute = jest.fn().mockResolvedValue({ affected });
  return qb;
}

describe('UsersService — désactivation pour inactivité', () => {
  let service: UsersService;
  let userRepo: { createQueryBuilder: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    userRepo = { createQueryBuilder: jest.fn(), update: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(ResetPassword), useValue: {} },
        { provide: getRepositoryToken(UserLicense), useValue: {} },
        { provide: getRepositoryToken(Federation), useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: ListsMembersService, useValue: {} },
        { provide: EncryptionService, useValue: {} },
        { provide: EmailService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('only targets role=0 accounts inactive since more than N months, returns the affected count', async () => {
    const qb = fakeQueryBuilder(3);
    userRepo.createQueryBuilder.mockReturnValue(qb);

    const count = await service.deactivateInactiveUsers(3);

    expect(count).toBe(3);
    expect(qb.where).toHaveBeenCalledWith('role = 0');
    expect(qb.andWhere).toHaveBeenCalledWith('status = :active', { active: 'active' });
    expect(qb.andWhere).toHaveBeenCalledWith(
      'last_login_at < :threshold',
      expect.objectContaining({ threshold: expect.any(Date) }),
    );
  });

  it('reactivateUser resets status and last_login_at', async () => {
    await service.reactivateUser('user-1');
    expect(userRepo.update).toHaveBeenCalledWith(
      { id: 'user-1' },
      expect.objectContaining({ status: 'active', deactivated_at: null, deactivation_reason: null }),
    );
  });
});
