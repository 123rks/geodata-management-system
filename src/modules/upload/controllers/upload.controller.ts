import {
  BadRequestException,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { I18nService } from 'nestjs-i18n';
import { DefaultResponse } from '../../../common/responses/response.interface';
import { UploadService } from '../services/upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly i18nService: I18nService,
    private readonly uploadService: UploadService,
  ) {}

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
