import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController — avatar/licence réservés aux admins', () => {
  let controller: UsersController;
  let usersService: { update: jest.Mock; upsertUserLicense: jest.Mock };

  beforeEach(() => {
    usersService = { update: jest.fn(), upsertUserLicense: jest.fn() };
    controller = new UsersController(usersService as any, {} as any, {} as any);
  });

  const req = (role: number) => ({ user: { role, id: 'self-id' } });
  const avatarFile = { fieldname: 'file' } as any;

  describe('update() — avatar', () => {
    it('rejects a non-admin (role 0) sending a file, even for their own account', async () => {
      await expect(
        controller.update('self-id', avatarFile, {}, req(0)),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('allows an admin (role 1) sending a file for another account', async () => {
      // uploadFileToGCS isn't reachable without GCS creds in this unit test —
      // stub it out to isolate the authorization check being tested here.
      (controller as any).uploadFileToGCS = jest.fn().mockResolvedValue('https://cdn/avatar.jpg');
      (controller as any).emptyGCSFolder = jest.fn().mockResolvedValue(undefined);

      await controller.update('other-id', avatarFile, {}, req(1));
      expect(usersService.update).toHaveBeenCalledWith(
        'other-id',
        expect.objectContaining({ avatar: 'https://cdn/avatar.jpg' }),
      );
    });

    it('allows a non-admin PATCH with no file (regular profile fields)', async () => {
      await controller.update('self-id', undefined as any, { weight: 70 }, req(0));
      expect(usersService.update).toHaveBeenCalledWith('self-id', { weight: 70 });
    });
  });

  describe('update() — grade/formation', () => {
    it('rejects a non-admin (role 0) sending grade/formation, even for their own account', async () => {
      await expect(
        controller.update('self-id', undefined as any, { grade: 'bleu' }, req(0)),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('allows an admin (role 1) to set grade/formation on another account', async () => {
      await controller.update('other-id', undefined as any, { grade: 'bleu', formation: 'BF1' }, req(1));
      expect(usersService.update).toHaveBeenCalledWith('other-id', { grade: 'bleu', formation: 'BF1' });
    });
  });

  describe('addOrUpdateLicense()', () => {
    it('rejects a non-admin (role 0), even for their own licence', () => {
      expect(() =>
        controller.addOrUpdateLicense('self-id', { federationCode: 'FMMAF', number: '123' }, req(0)),
      ).toThrow(ForbiddenException);
      expect(usersService.upsertUserLicense).not.toHaveBeenCalled();
    });

    it('allows an admin (role 1) to set a licence on another account', () => {
      controller.addOrUpdateLicense('other-id', { federationCode: 'FMMAF', number: '123' }, req(1));
      expect(usersService.upsertUserLicense).toHaveBeenCalledWith('other-id', 'FMMAF', '123');
    });

    it('allows a super admin (role 2)', () => {
      controller.addOrUpdateLicense('other-id', { federationCode: 'FMMAF', number: '123' }, req(2));
      expect(usersService.upsertUserLicense).toHaveBeenCalledWith('other-id', 'FMMAF', '123');
    });
  });
});
