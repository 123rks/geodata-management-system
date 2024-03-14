import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import config from './common/config/config';
import { DatabaseConfig } from './common/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/common/i18n/'),
        watch: true,
      },
      typesOutputPath: path.join(
        __dirname,
        '../src/common/i18n/generated/i18n.generated.ts',
      ),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
