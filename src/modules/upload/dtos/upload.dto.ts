import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UploadDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      label: 'File',
    }),
  })
  file: Express.Multer.File;
}
