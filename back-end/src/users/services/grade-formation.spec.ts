import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/users.entity';
import { ResetPassword } from '../entities/reset-password.entity';
import { UserLicense } from '../entities/user-license.entity';
import { Federation } from '../../federations/federations.entity';
import { ListsMembersService } from '../../lists-members/lists-members.service';
import { EncryptionService } from './encryption.service';
import { EmailService } from './email.service';

describe('UsersService — grade & formation', () => {
  let service: UsersService;
  let userRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ id: 'user-1', grade: 'blanc', formation: 'aucune' })
        .mockResolvedValue({ id: 'user-1', grade: 'bleu', formation: 'BF1' }),
      save: jest.fn((u) => u),
    };

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

  it('accepts a valid grade/formation pair', async () => {
    await expect(
      service.update('user-1', { grade: 'bleu', formation: 'BF1' } as any),
    ).resolves.toBeDefined();
    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ grade: 'bleu', formation: 'BF1' }),
    );
  });

  it('rejects an invalid grade', async () => {
    await expect(
      service.update('user-1', { grade: 'rose-bonbon' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an invalid formation', async () => {
    await expect(
      service.update('user-1', { formation: 'ceinture-noire' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
