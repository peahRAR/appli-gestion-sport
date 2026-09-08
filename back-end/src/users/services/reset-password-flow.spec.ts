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

describe('UsersService — reset password flow', () => {
  let service: UsersService;
  let resetPasswordRepo: { findOne: jest.Mock; save: jest.Mock };
  let userRepo: { findOne: jest.Mock; save: jest.Mock };

  const VALID_RECORD = {
    id: 1,
    userId: 'user-1',
    token: 'valid-token',
    expires: new Date(Date.now() + 60 * 60_000),
    usedAt: null,
  };

  beforeEach(async () => {
    resetPasswordRepo = { findOne: jest.fn(), save: jest.fn((r) => r) };
    userRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'user-1', password: 'old-hash' }),
      save: jest.fn((u) => u),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(ResetPassword), useValue: resetPasswordRepo },
        { provide: getRepositoryToken(UserLicense), useValue: {} },
        { provide: getRepositoryToken(Federation), useValue: {} },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: ListsMembersService, useValue: {} },
        { provide: EncryptionService, useValue: {} },
        { provide: EmailService, useValue: { sendResetPasswordEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('validateResetToken', () => {
    it('resolves for a valid, unused, unexpired token', async () => {
      resetPasswordRepo.findOne.mockResolvedValue(VALID_RECORD);
      await expect(service.validateResetToken('valid-token')).resolves.toEqual({ valid: true });
    });

    it('rejects with RESET_TOKEN_INVALID when the token does not exist', async () => {
      resetPasswordRepo.findOne.mockResolvedValue(null);
      await expect(service.validateResetToken('nope')).rejects.toMatchObject({
        response: { code: 'RESET_TOKEN_INVALID' },
      });
    });

    it('rejects with RESET_TOKEN_EXPIRED when past the expiry date', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({
        ...VALID_RECORD,
        expires: new Date(Date.now() - 1000),
      });
      await expect(service.validateResetToken('expired')).rejects.toMatchObject({
        response: { code: 'RESET_TOKEN_EXPIRED' },
      });
    });

    it('rejects with RESET_TOKEN_USED when already consumed', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({ ...VALID_RECORD, usedAt: new Date() });
      await expect(service.validateResetToken('used')).rejects.toMatchObject({
        response: { code: 'RESET_TOKEN_USED' },
      });
    });
  });

  describe('resetPassword', () => {
    it('hashes the new password and marks the token used, on a valid token', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({ ...VALID_RECORD });
      await service.resetPassword('valid-token', 'Abcdefg1.');
      expect(userRepo.save).toHaveBeenCalled();
      const savedUser = userRepo.save.mock.calls[0][0];
      expect(savedUser.password).not.toBe('Abcdefg1.'); // hashed, not plaintext
      const savedRecord = resetPasswordRepo.save.mock.calls[0][0];
      expect(savedRecord.usedAt).toBeInstanceOf(Date);
    });

    it('rejects a non-conforming password on an otherwise valid token', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({ ...VALID_RECORD });
      await expect(service.resetPassword('valid-token', 'weak')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('rejects an expired token without touching the user', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({
        ...VALID_RECORD,
        expires: new Date(Date.now() - 1000),
      });
      await expect(service.resetPassword('expired', 'Abcdefg1.')).rejects.toMatchObject({
        response: { code: 'RESET_TOKEN_EXPIRED' },
      });
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('rejects reusing an already-used token', async () => {
      resetPasswordRepo.findOne.mockResolvedValue({ ...VALID_RECORD, usedAt: new Date() });
      await expect(service.resetPassword('used', 'Abcdefg1.')).rejects.toMatchObject({
        response: { code: 'RESET_TOKEN_USED' },
      });
      expect(userRepo.save).not.toHaveBeenCalled();
    });
  });
});
