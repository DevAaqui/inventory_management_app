import {
  getIronSession,
  type IronSession,
  type SessionOptions,
} from "iron-session";
import { cookies } from "next/headers";

/** Session payload stored in the encrypted cookie. */
export type StockflowSessionData = {
  userId?: string;
  organizationId?: string;
  email?: string;
  organizationName?: string;
  isLoggedIn?: boolean;
};

function sessionPassword(): string {
  const pwd = process.env.SESSION_PASSWORD;
  if (!pwd || pwd.length < 32) {
    throw new Error(
      "SESSION_PASSWORD must be set and at least 32 characters (see .env.example).",
    );
  }
  return pwd;
}

export const defaultSessionOptions: Omit<SessionOptions, "password"> = {
  cookieName: "stockflow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  },
};

export async function getSession(): Promise<
  IronSession<StockflowSessionData>
> {
  const cookieStore = await cookies();
  return getIronSession<StockflowSessionData>(cookieStore, {
    ...defaultSessionOptions,
    password: sessionPassword(),
  });
}
