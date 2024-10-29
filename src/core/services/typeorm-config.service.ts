import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '~/modules/users/entities';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'postgres',
      schema: process.env.DB_SCHEMA || 'public',
      autoLoadEntities: true,
      synchronize: Boolean(process.env.DB_SYNC === 'true') || false,
      logging: Boolean(process.env.DB_LOGGING === 'true') || false,

      // ** Entities should be added manually
      entities: [User],
    };
  }
}
