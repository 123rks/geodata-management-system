import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../consts/skip-auth';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return this.validateJwt(request);
  }

  async validateJwt(request: any) {
    const token = request.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException();
    }

    const [authType, authToken] = token.split(' ');

    if (authType == 'Bearer' && authToken) {
      const user = jwt.verify(authToken, String(this.config.get('jwt_secret')));

      if (!user) {
        throw new UnauthorizedException();
      }

      request.user = user;
      return true;
    }
    return false;
  }
}
