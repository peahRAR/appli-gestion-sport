// data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: { rejectUnauthorized: false },
  entities: [__dirname + '/src/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/src/migrations/*.{ts,js}'],
  synchronize: false,
});
