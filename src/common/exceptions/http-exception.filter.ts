import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import {
  I18nContext,
  I18nValidationException,
  I18nValidationExceptionFilterDetailedErrorsOption,
  I18nValidationExceptionFilterErrorFormatterOption,
} from 'nestjs-i18n';
import { formatI18nErrors } from 'nestjs-i18n/dist/utils';

type I18nValidationExceptionFilterOptions =
  | I18nValidationExceptionFilterDetailedErrorsOption
  | I18nValidationExceptionFilterErrorFormatterOption;

@Catch(HttpException)
@Catch(I18nValidationException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly options: I18nValidationExceptionFilterOptions = {
      detailedErrors: true,
    },
  ) {}

  catch(exception: I18nValidationException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    const exceptionResponse: any = exception.getResponse();

    const i18n = I18nContext.current();

    const errors = formatI18nErrors(exception.errors ?? [], i18n.service, {
      lang: i18n.lang,
    });

    const status =
      this.options.errorHttpStatusCode ||
      exception.getStatus() ||
      exceptionResponse['status'];
    let message = '';

    if (errors.length > 0) {
      if (errors[0]) {
        const firstError = errors[0].constraints;
        if (firstError) {
          message = firstError[Object.keys(firstError)[0]];
        }
      }
    } else {
      message = exception.message;
    }

    const res = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      errors,
    };
    response.status(status).send(res);
  }
}
