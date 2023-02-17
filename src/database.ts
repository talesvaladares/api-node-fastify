import { knex as stupKnex, Knex } from 'knex';
import { env } from './env';

const sqliteConnection = {
  filename: env.DATABASE_URL,
}

const postgreConnection = {
  filename: env.DATABASE_URL,

}

export const config : Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite'? sqliteConnection : postgreConnection,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations'
  }
}

export const knex = stupKnex(config);