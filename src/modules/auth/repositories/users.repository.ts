import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../../../entities/users.entity';

@Injectable()
export class UsersRepository extends Repository<Users> {
  constructor(private dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  async findByUsername(username: string) {
    return this.findOne({
      select: {
        id: true,
        password_hash: true,
        username: true,
        name: true,
      },
      where: { username, active: true },
    });
  }
}
