"use server";

import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createOrganizationAndUser,
  DuplicateEmailError,
  findUserWithOrgByEmail,
  type UserWithOrg,
} from "@/lib/db/auth-repository";
import { getSession } from "@/lib/session";

const BCRYPT_ROUNDS = 10;

const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Enter a valid email address")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Confirm your password")
      .min(8, "Password must be at least 8 characters"),
    organizationName: z
      .string()
      .trim()
      .min(1, "Organization name is required")
      .max(255, "Organization name is too long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Enter a valid email address")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AuthActionState = {
  error?: string;
};

function firstZodMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue?.message ?? "Invalid input";
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    organizationName: String(formData.get("organizationName") ?? ""),
  });

  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const { email, password, organizationName } = parsed.data;

  try {
    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    const { userId, organizationId } = await createOrganizationAndUser({
      email,
      passwordHash,
      organizationName,
    });

    const session = await getSession();
    session.userId = userId;
    session.organizationId = organizationId;
    session.email = email.trim().toLowerCase();
    session.organizationName = organizationName.trim();
    session.isLoggedIn = true;
    await session.save();
  } catch (e) {
    if (e instanceof DuplicateEmailError) {
      return { error: e.message };
    }
    throw e;
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const { email, password } = parsed.data;

  let user: UserWithOrg | null = null;
  try {
    user = await findUserWithOrgByEmail(email);
  } catch {
    return { error: "Invalid email or password" };
  }

  if (!user) {
    return { error: "Invalid email or password" };
  }

  let passwordMatch = false;
  try {
    passwordMatch = await compare(password, user.passwordHash);
  } catch {
    passwordMatch = false;
  }

  if (!passwordMatch) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.userId;
  session.organizationId = user.organizationId;
  session.email = user.email;
  session.organizationName = user.organizationName;
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  await session.save();
  redirect("/login");
}
