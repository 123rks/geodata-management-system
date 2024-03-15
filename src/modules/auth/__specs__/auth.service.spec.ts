import { TestBed } from '@automock/jest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { Users } from '../../../entities/users.entity';
import { LoginRequest } from '../interfaces/login.interface';
import { UsersRepository } from '../repositories/users.repository';
import { AuthService } from '../services/auth.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let i18nService: jest.Mocked<I18nService>;
  let authUsersRepository: jest.Mocked<UsersRepository>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();
    authService = unit;
    jwtService = unitRef.get(JwtService);
    i18nService = unitRef.get(I18nService);
    authUsersRepository = unitRef.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const userMock = new Users();
      userMock.id = 1;
      userMock.username = 'admin';
      userMock.name = 'Administrator';
      userMock.password_hash = 'hashedPassword';

      const req: LoginRequest = {
        username: 'admin',
        password: 'admin',
      };

      const findByUsernameMock =
        authUsersRepository.findByUsername.mockResolvedValueOnce(userMock);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jwtService.sign.mockReturnValue('token');

      const result = await authService.login(req);

      expect(findByUsernameMock).toHaveBeenCalledWith('admin');
      expect(result).toEqual({
        result: {
          token: 'token',
          profile: {
            username: 'admin',
            name: 'Administrator',
          },
        },
        message: i18nService.t('auth.successLogin'),
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const req: LoginRequest = {
        username: 'nonexistent',
        password: 'admin',
      };
      authUsersRepository.findByUsername.mockResolvedValue(null);

      await expect(authService.login(req)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(req)).rejects.toThrow(
        i18nService.t('auth.failedLogin.userNotFound'),
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const userMock = new Users();
      userMock.id = 1;
      userMock.username = 'admin';
      userMock.name = 'Administrator';
      userMock.password_hash = 'fakeHash';

      const req: LoginRequest = {
        username: 'admin',
        password: 'wrongPassword',
      };

      authUsersRepository.findByUsername.mockResolvedValue(userMock);

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(req)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(req)).rejects.toThrow(
        i18nService.t('auth.failedLogin.passwordNotMatch'),
      );
    });
  });

  describe('seedUser', () => {
    it('should create user if not exist', async () => {
      const findByUsernameMock =
        authUsersRepository.findByUsername.mockResolvedValue(null);
      const insertMock =
        authUsersRepository.insert.mockResolvedValueOnce(undefined);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      await authService.seedUser();

      expect(findByUsernameMock).toHaveBeenCalledWith('admin');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'admin',
          name: 'Administrator',
          active: true,
          password_hash: 'hashedPassword',
        }),
      );
    });

    it('should not create user if exist', async () => {
      const userMock = new Users();
      userMock.id = 1;

      const findByUsernameMock =
        authUsersRepository.findByUsername.mockResolvedValueOnce(userMock);

      await authService.seedUser();

      expect(findByUsernameMock).toHaveBeenCalledWith('admin');
      expect(authUsersRepository.insert).not.toHaveBeenCalled();
    });
  });
});
