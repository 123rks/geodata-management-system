import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      label: 'Username',
    }),
  })
  username: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      label: 'Password',
    }),
  })
  password: string;
}
