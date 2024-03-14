import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { Users } from '../../../entities/users.entity';
import { LoginRequest, LoginResult } from '../interfaces/login.interface';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly authUsersRepository: UsersRepository,
  ) {}

  async login(req: LoginRequest) {
    const user = await this.authUsersRepository.findByUsername(req.username);
    if (!user) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.failedLogin.userNotFound'),
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      req.password,
      user.password_hash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.failedLogin.passwordNotMatch'),
      );
    }

    const tokenPayload = {
      user_id: user.id,
      username: user.username,
      name: user.name,
    };
    const result: LoginResult = {
      token: this.jwtService.sign(tokenPayload),
      profile: {
        username: user.username,
        name: user.name,
      },
    };
    return {
      result,
      message: this.i18nService.t('auth.successLogin', {
        args: {
          name: user.name,
        },
      }),
    };
  }

  async seedUser() {
    const usersToCreate = [
      {
        username: 'admin',
        password: 'admin',
        name: 'Administrator',
      },
    ];
    for (const userData of usersToCreate) {
      const existingUser = await this.authUsersRepository.findByUsername(
        userData.username,
      );
      if (!existingUser) {
        const user = new Users();
        user.username = userData.username;
        user.name = userData.name;
        user.active = true;
        user.password_hash = await bcrypt.hash(userData.password, 10);
        await this.authUsersRepository.insert(user);
        console.log(`User ${user.name} created`);
      }
    }
  }
}
