"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateOrganizationDefaultLowStock } from "@/lib/db/product-repository";
import { getSession } from "@/lib/session";

const defaultLowStockValueSchema = z
  .number()
  .int("Use a whole number")
  .min(0, "Must be at least 0")
  .max(2_147_483_647, "Value is too large");

export type SettingsActionState = {
  error?: string;
  success?: boolean;
};

/** Returns the first validation message from a Zod error for display. */
function firstZodMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue?.message ?? "Invalid input";
}

/** Updates the org-wide default low-stock threshold from form data; revalidates related routes. */
export async function updateDefaultLowStockAction(
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.organizationId) {
    redirect("/login");
  }

  const orgId = session.organizationId;
  const raw = String(formData.get("defaultLowStockThreshold") ?? "").trim();
  if (!raw) {
    return { error: "Default low stock threshold is required" };
  }

  const asInt = Number.parseInt(raw, 10);
  const parsed = defaultLowStockValueSchema.safeParse(asInt);
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const ok = await updateOrganizationDefaultLowStock(orgId, parsed.data);
  if (!ok) {
    return { error: "Could not update settings" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/settings");
  return { success: true };
}
