import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
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
}
