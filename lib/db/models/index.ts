import type { Sequelize } from "sequelize";
import { Organization, initOrganizationModel } from "./organization";
import { Product, initProductModel } from "./product";
import { Role, initRoleModel } from "./role";
import { User, initUserModel } from "./user";

export { Organization, Product, Role, User };
export { ADMIN_ROLE_ID } from "./role";

export function initModels(sequelize: Sequelize): void {
  initOrganizationModel(sequelize);
  initRoleModel(sequelize);
  initUserModel(sequelize);
  initProductModel(sequelize);

  Organization.hasMany(User, { foreignKey: "organizationId" });
  User.belongsTo(Organization, {
    foreignKey: "organizationId",
    as: "organization",
  });

  Role.hasMany(User, { foreignKey: "roleId" });
  User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

  Organization.hasMany(Product, { foreignKey: "organizationId" });
  Product.belongsTo(Organization, { foreignKey: "organizationId" });
}
