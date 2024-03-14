import * as process from 'process';

export default () => ({
  app: {
    env: process.env.APP_ENV,
    port: process.env.APP_PORT,
  },
  db: {
    type: 'mysql',
    entities: [__dirname + '/../../**/**/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.APP_ENV === 'development' ?? false,
    logger: 'file',
    timezone: 'Z',
    bigNumberStrings: false,
    supportBigNumbers: true,
    legacySpatialSupport: false,
    replication: {
      master: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
      },
      slaves: [
        {
          host: process.env.DB_SLAVE_HOST,
          port: process.env.DB_SLAVE_PORT,
          username: process.env.DB_SLAVE_USER,
          password: process.env.DB_SLAVE_PASS,
          database: process.env.DB_SLAVE_NAME,
        },
      ],
    },
  },
  jwt_secret: process.env.JWT_SECRET,
});
