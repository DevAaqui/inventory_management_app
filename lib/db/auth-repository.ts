import { UniqueConstraintError } from "sequelize";
import { getSequelize } from "./sequelize";
import { Organization } from "./models/organization";
import { ADMIN_ROLE_ID } from "./models/role";
import { User } from "./models/user";

export async function getUserEmailById(userId: string): Promise<string | null> {
  getSequelize();
  const user = await User.findByPk(userId, { attributes: ["email"] });
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

  const user = await User.findOne({
    where: { email: normalized },
  });

  if (!user) return null;

  const org = await Organization.findByPk(user.organizationId);
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
      const org = await Organization.create(
        {
          name: input.organizationName.trim(),
          defaultLowStockThreshold: 5,
        },
        { transaction },
      );
      const user = await User.create(
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
