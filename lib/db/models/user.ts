import { randomUUID } from "crypto";
import type { Sequelize } from "sequelize";
import { DataTypes, Model, type Optional } from "sequelize";

export type UserAttrs = {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
};

export type UserCreationAttrs = Optional<UserAttrs, "id">;

export class User extends Model<UserAttrs, UserCreationAttrs> {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare organizationId: string;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: () => randomUUID(),
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      organizationId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        field: "organization_id",
        references: { model: "organizations", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    },
  );
  return User;
}
