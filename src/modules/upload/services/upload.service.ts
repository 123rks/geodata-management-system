import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as fs from 'fs';
import * as JSONStream from 'jsonstream';
import * as through2 from 'through2';
import { LocationData } from '../interfaces/locations.interface';
import * as _ from 'lodash';
import { LocationsRepository } from '../repositories/locations.repository';

@Injectable()
export class UploadService {
  locations: LocationData[] = [];
  constructor(
    private readonly i18nService: I18nService,
    private readonly locationsRepository: LocationsRepository,
  ) {}

  async create(filePath: string) {
    this.locations = [];
    const validateFile = await this.validateGeoJson(filePath);
    if (!validateFile) {
      this.deleteFile(filePath);
      throw new BadRequestException(this.i18nService.t('upload.invalidFile'));
    }

    const locations = _.chunk(this.locations, 100);

    for (const location of locations) {
      await this.locationsRepository.createLocation(location);
    }
    return this.i18nService.t('upload.success');
  }

  async validateGeoJson(filePath: string) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);

      let isValid = true;

      readStream
        .pipe(JSONStream.parse('features.*'))
        .pipe(
          through2.obj((feature, enc, cb) => {
            if (!feature && !feature.geometry && !feature.properties) {
              isValid = false;
              readStream.destroy();
            } else {
              this.locations.push({
                name: feature.properties.name,
                location: `POINT(${feature.geometry.coordinates[0]} ${feature.geometry.coordinates[1]})`,
              });
            }
            cb();
          }),
        )
        .on('error', (err) => {
          reject(err);
        })
        .on('finish', () => {
          this.deleteFile(filePath);
          resolve(isValid);
        });
    });
  }

  private deleteFile(filePath: string) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
