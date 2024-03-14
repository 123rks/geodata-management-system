import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Locations } from '../../../entities/locations.entity';

@Injectable()
export class LocationsRepository extends Repository<Locations> {
  constructor(private dataSource: DataSource) {
    super(Locations, dataSource.createEntityManager());
  }

  async createLocation(locations: Locations[]) {
    return this.createQueryBuilder().insert().values(locations).execute();
  }
}
