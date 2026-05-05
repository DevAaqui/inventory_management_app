import mysql2 from "mysql2";
import { Sequelize } from "sequelize";
import { initModels } from "./models";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

const globalForSequelize = globalThis as unknown as {
  sequelize?: Sequelize;
};

export function getSequelize(): Sequelize {
  if (!globalForSequelize.sequelize) {
    const sequelize = new Sequelize(requireEnv("DATABASE_URL"), {
      dialect: "mysql",
      dialectModule: mysql2,
      logging: process.env.NODE_ENV === "development" ? console.log : false,
    });
    initModels(sequelize);
    globalForSequelize.sequelize = sequelize;
  }
  return globalForSequelize.sequelize;
}
