import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Provider extends Model {
  declare id: number;
  declare name: string;
  declare latitude: number;
  declare longitude: number;
  declare rating: number;
}

Provider.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: "providers", sequelize }
);