import {
  BadRequestException,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { DefaultResponse } from '../../../common/responses/response.interface';
import { UploadService } from '../services/upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly i18nService: I18nService,
    private readonly uploadService: UploadService,
  ) {}

  @ApiOperation({
    summary: 'Upload GeoJSON file, validate and save to database',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Upload Success',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.CREATED,
        },
        message: {
          type: 'string',
          example: 'Upload success!',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File not uploaded or Invalid GeoJSON file',
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
          'Empty File': {
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Please upload GeoJSON file',
            },
          },
          'Invalid GeoJSON': {
            value: {
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Invalid GeoJSON file',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: HttpStatus.UNAUTHORIZED,
        },
        message: {
          type: 'string',
          example: 'Unauthorized',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 100000000 },
    }),
  )
  @Post()
  async create(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(this.i18nService.t('upload.fileRequired'));
    }
    const result = await this.uploadService.create(file.path);
    const res: DefaultResponse = {
      statusCode: HttpStatus.CREATED,
      message: result,
    };
    return res;
  }
}
