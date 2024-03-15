import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const markdownDescription = `
    ### Introduction

    This is the GeoData Management System API documentation, created by Rifky Syaripudin.
    
    ### Authentication
    You can use **Access Token** on API Login.
  `;

  const docConfig = new DocumentBuilder()
    .setTitle('GeoData Management System API')
    .setDescription(markdownDescription)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description: 'Enter JWT Token from login',
    })
    .build();

  const doc = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api', app, doc);

  await app.listen(config.get('app.port'), '0.0.0.0');
}
bootstrap();
