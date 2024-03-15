import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../consts/skip-auth';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponse } from '../interfaces/login.interface';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Login to get a Token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'admin',
        },
        password: {
          type: 'string',
          example: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Login Success',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.CREATED,
        },
        message: {
          type: 'string',
          example: 'Login success, welcome back Administrator!',
        },
        result: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYyMzI3NjA3Mn0.2tY3Yr4X3l7NQ8L8XfX3Ji4Y4V3l7NQ8L8XfX3Ji4Y4',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  property: {
                    type: 'string',
                  },
                  constraints: {
                    type: 'object',
                    properties: {
                      isNotEmpty: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        examples: {
          'Username & Password Empty': {
            value: {
              statusCode: 400,
              message: 'Enter the Username, because is required.',
              errors: [
                {
                  property: 'username',
                  constraints: {
                    isNotEmpty: 'Enter the Username, because is required.',
                  },
                },
                {
                  property: 'password',
                  constraints: {
                    isNotEmpty: 'Enter the Password, because is required.',
                  },
                },
              ],
            },
          },
          'Username Empty': {
            value: {
              statusCode: 400,
              message: 'Enter the Username, because is required.',
              errors: [
                {
                  property: 'username',
                  constraints: {
                    isNotEmpty: 'Enter the Username, because is required.',
                  },
                },
              ],
            },
          },
          'Password Empty': {
            value: {
              statusCode: 400,
              message: 'Enter the Password, because is required.',
              errors: [
                {
                  property: 'password',
                  constraints: {
                    isNotEmpty: 'Enter the Password, because is required.',
                  },
                },
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Username not found or wrong Password',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
            },
            message: {
              type: 'string',
            },
          },
        },
        examples: {
          'User not found': {
            value: {
              statusCode: 401,
              message: 'Login failed, User not registered!',
            },
          },
          'Wrong password': {
            value: {
              statusCode: 401,
              message: 'Login failed, wrong Password!',
            },
          },
        },
      },
    },
  })
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
