import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { UsersRepository } from './repositories/users.repository';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt_secret'),
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, ConfigService, JwtStrategy],
})
export class AuthModule {}
