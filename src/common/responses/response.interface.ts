import { HttpStatus } from '@nestjs/common';

export interface DefaultResponse {
  statusCode: HttpStatus;
  message?: string;
}
