import { Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { LocationsRepository } from './repositories/locations.repository';
import { UploadService } from './services/upload.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, LocationsRepository],
})
export class UploadModule {}
