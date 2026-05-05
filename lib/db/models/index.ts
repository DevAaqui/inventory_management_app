import type { Sequelize } from "sequelize";
import { Organization, initOrganizationModel } from "./organization";
import { User, initUserModel } from "./user";

export { Organization, User };

export function initModels(sequelize: Sequelize): void {
  initOrganizationModel(sequelize);
  initUserModel(sequelize);

  Organization.hasMany(User, { foreignKey: "organizationId" });
  User.belongsTo(Organization, {
    foreignKey: "organizationId",
    as: "organization",
  });
}
