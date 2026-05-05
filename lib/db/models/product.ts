import { randomUUID } from "crypto";
import type { Sequelize } from "sequelize";
import { DataTypes, Model, type Optional } from "sequelize";

export type ProductAttrs = {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: string | null;
  sellingPrice: string | null;
  lowStockThreshold: number | null;
  stockUpdatedAt: Date | null;
  stockUpdatedByUserId: string | null;
  stockUpdateNote: string | null;
};

export type ProductCreationAttrs = Optional<
  ProductAttrs,
  | "id"
  | "description"
  | "costPrice"
  | "sellingPrice"
  | "lowStockThreshold"
  | "quantityOnHand"
  | "stockUpdatedAt"
  | "stockUpdatedByUserId"
  | "stockUpdateNote"
>;

export class Product extends Model<ProductAttrs, ProductCreationAttrs> {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare sku: string;
  declare description: string | null;
  declare quantityOnHand: number;
  declare costPrice: string | null;
  declare sellingPrice: string | null;
  declare lowStockThreshold: number | null;
  declare stockUpdatedAt: Date | null;
  declare stockUpdatedByUserId: string | null;
  declare stockUpdateNote: string | null;
}

export function initProductModel(sequelize: Sequelize): typeof Product {
  Product.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      organizationId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        field: "organization_id",
        references: { model: "organizations", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantityOnHand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "quantity_on_hand",
        validate: { min: 0 },
      },
      costPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "cost_price",
      },
      sellingPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "selling_price",
      },
      lowStockThreshold: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "low_stock_threshold",
      },
      stockUpdatedAt: {
        type: DataTypes.DATE(3),
        allowNull: true,
        field: "stock_updated_at",
      },
      stockUpdatedByUserId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        field: "stock_updated_by_user_id",
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      stockUpdateNote: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "stock_update_note",
      },
    },
    {
      sequelize,
      tableName: "products",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["organizationId", "sku"],
          name: "products_organization_sku_unique",
        },
      ],
    },
  );
  return Product;
}
