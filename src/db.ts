import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? "providers_nearby",
  process.env.DB_USER ?? "root",
  process.env.DB_PASS ?? "Javapro_0948",
  {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: "mysql",
    logging: false,
    pool: { max: 20, min: 0, acquire: 30000, idle: 10000 },
  }
);