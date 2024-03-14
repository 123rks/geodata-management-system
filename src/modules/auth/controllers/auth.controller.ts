import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../consts/skip-auth';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponse } from '../interfaces/login.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() payload: LoginDto) {
    const login = await this.authService.login(payload);
    const response: LoginResponse = {
      statusCode: HttpStatus.CREATED,
      message: login.message,
      result: login.result,
    };
    return response;
  }
}
