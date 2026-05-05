import type { Sequelize } from "sequelize";
import { DataTypes, Model, type Optional } from "sequelize";

/** Stable primary key for the seeded `admin` row (see db/migrations/002_roles.sql). */
export const ADMIN_ROLE_ID = 1 as const;

export type RoleAttrs = {
  id: number;
  name: string;
};

export type RoleCreationAttrs = Optional<RoleAttrs, "id">;

export class Role extends Model<RoleAttrs, RoleCreationAttrs> {
  declare id: number;
  declare name: string;
}

export function initRoleModel(sequelize: Sequelize): typeof Role {
  Role.init(
    {
      id: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      tableName: "roles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    },
  );
  return Role;
}
