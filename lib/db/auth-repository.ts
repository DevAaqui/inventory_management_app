import { type ModelStatic, UniqueConstraintError } from "sequelize";
import { getSequelize } from "./sequelize";
import type { Organization } from "./models/organization";
import { ADMIN_ROLE_ID } from "./models/role";
import type { User } from "./models/user";

/** Registered Sequelize model (avoids duplicate-module / Turbopack HMR issues). */
function userModel(): ModelStatic<User> {
  return getSequelize().model("User") as ModelStatic<User>;
}

function organizationModel(): ModelStatic<Organization> {
  return getSequelize().model("Organization") as ModelStatic<Organization>;
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  getSequelize();
  const user = await userModel().findByPk(userId, { attributes: ["email"] });
  return user?.email ?? null;
}

export type UserWithOrg = {
  userId: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  organizationName: string;
};

export async function findUserWithOrgByEmail(
  email: string,
): Promise<UserWithOrg | null> {
  getSequelize();
  const normalized = email.trim().toLowerCase();

  const user = await userModel().findOne({
    where: { email: normalized },
  });

  if (!user) return null;

  const org = await organizationModel().findByPk(user.organizationId);
  if (!org) return null;

  return {
    userId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    organizationId: user.organizationId,
    organizationName: org.name,
  };
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

/**
 * Creates organization + user in one transaction (tenant signup).
 */
export async function createOrganizationAndUser(input: {
  organizationName: string;
  email: string;
  passwordHash: string;
}): Promise<{ userId: string; organizationId: string }> {
  const sequelize = getSequelize();
  const email = input.email.trim().toLowerCase();

  try {
    return await sequelize.transaction(async (transaction) => {
      const org = await organizationModel().create(
        {
          name: input.organizationName.trim(),
          defaultLowStockThreshold: 5,
        },
        { transaction },
      );
      const user = await userModel().create(
        {
          email,
          passwordHash: input.passwordHash,
          organizationId: org.id,
          roleId: ADMIN_ROLE_ID,
        },
        { transaction },
      );
      return { userId: user.id, organizationId: org.id };
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      throw new DuplicateEmailError();
    }
    throw e;
  }
}
