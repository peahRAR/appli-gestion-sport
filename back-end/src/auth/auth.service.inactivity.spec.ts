import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService — compte désactivé pour inactivité', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock; touchLastLogin: jest.Mock };

  const passwordHash = bcrypt.hashSync('Abcdefg1.', 10);

  beforeEach(() => {
    usersService = { findByEmail: jest.fn(), touchLastLogin: jest.fn() };
    service = new AuthService(usersService as any, {} as any, {} as any);
  });

  it('rejects a correct password on a deactivated_inactivity account', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      isActive: true,
      status: 'deactivated_inactivity',
      password: passwordHash,
    });

    await expect(service.validateUser('a@b.com', 'Abcdefg1.')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('accepts a correct password on an active account', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      isActive: true,
      status: 'active',
      password: passwordHash,
    });

    await expect(service.validateUser('a@b.com', 'Abcdefg1.')).resolves.toMatchObject({
      id: 'user-1',
    });
  });

  it('still rejects a wrong password before ever checking status (no enumeration)', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      isActive: true,
      status: 'deactivated_inactivity',
      password: passwordHash,
    });

    await expect(service.validateUser('a@b.com', 'wrong-password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
