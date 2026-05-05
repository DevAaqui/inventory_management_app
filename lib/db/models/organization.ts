import { randomUUID } from "crypto";
import type { Sequelize } from "sequelize";
import { DataTypes, Model, type Optional } from "sequelize";

export type OrganizationAttrs = {
  id: string;
  name: string;
  defaultLowStockThreshold: number;
};

export type OrganizationCreationAttrs = Optional<
  OrganizationAttrs,
  "id" | "defaultLowStockThreshold"
>;

export class Organization extends Model<
  OrganizationAttrs,
  OrganizationCreationAttrs
> {
  declare id: string;
  declare name: string;
  declare defaultLowStockThreshold: number;
}

export function initOrganizationModel(sequelize: Sequelize): typeof Organization {
  Organization.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      defaultLowStockThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        field: "default_low_stock_threshold",
      },
    },
    {
      sequelize,
      tableName: "organizations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    },
  );
  return Organization;
}
