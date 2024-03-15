import { TestBed } from '@automock/jest';
import { BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { LocationData } from '../interfaces/locations.interface';
import { LocationsRepository } from '../repositories/locations.repository';
import { UploadService } from '../services/upload.service';

describe('UploadService', () => {
  let uploadService: UploadService;
  let i18nService: jest.Mocked<I18nService>;
  let locationsRepository: jest.Mocked<LocationsRepository>;

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(UploadService).compile();
    uploadService = unit;
    i18nService = unitRef.get(I18nService);
    locationsRepository = unitRef.get(LocationsRepository);
  });

  it('should create locations from valid GeoJSON file', async () => {
    const filePath = 'validFile.geojson';
    const mockLocations: LocationData[] = [
      {
        name: 'Location 1',
        location: 'POINT(1 1)',
      },
      {
        name: 'Location 2',
        location: 'POINT(2 2)',
      },
    ];
    uploadService.validateGeoJson = jest.fn().mockResolvedValueOnce(true);
    uploadService.locations = mockLocations;
    locationsRepository.createLocation.mockResolvedValueOnce(undefined);

    const result = await uploadService.create(filePath);

    expect(uploadService.validateGeoJson).toHaveBeenCalledWith(filePath);
    expect(result).toEqual(i18nService.t('upload.success'));
  });

  it('should throw BadRequestException if file is invalid', async () => {
    const filePath = 'invalidFile.geojson';
    uploadService.validateGeoJson = jest.fn().mockResolvedValueOnce(false);
    uploadService.deleteFile = jest.fn();
    locationsRepository.createLocation = jest.fn();

    await expect(uploadService.create(filePath)).rejects.toThrow(
      BadRequestException,
    );
    await expect(uploadService.create(filePath)).rejects.toThrow(
      i18nService.t('upload.invalidFile'),
    );
    expect(uploadService.deleteFile).toHaveBeenCalledWith(filePath);
    expect(locationsRepository.createLocation).not.toHaveBeenCalled();
  });
});
