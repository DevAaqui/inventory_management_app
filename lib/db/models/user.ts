import { randomUUID } from "crypto";
import type { Sequelize } from "sequelize";
import { DataTypes, Model, type Optional } from "sequelize";
import { ADMIN_ROLE_ID } from "./role";

export type UserAttrs = {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  roleId: number;
};

export type UserCreationAttrs = Optional<UserAttrs, "id" | "roleId">;

export class User extends Model<UserAttrs, UserCreationAttrs> {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare organizationId: string;
  declare roleId: number;
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
      roleId: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: ADMIN_ROLE_ID,
        field: "role_id",
        references: { model: "roles", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    },
  );
  return User;
}
