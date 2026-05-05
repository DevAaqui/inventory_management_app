"use server";

import { revalidatePath } from "next/cache";
import { UniqueConstraintError } from "sequelize";
import { redirect } from "next/navigation";
import { parseProductFormData } from "@/lib/products/parse-product-form";
import {
  adjustProductStock,
  createProductForOrganization,
  deleteProductForOrganization,
  updateProductForOrganization,
} from "@/lib/db/product-repository";
import { parseAdjustStockFormData } from "@/lib/products/parse-adjust-stock";
import { getSession } from "@/lib/session";

export type ProductActionState = { error?: string };

async function requireOrganizationId(): Promise<string> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.organizationId) {
    redirect("/login");
  }
  return session.organizationId;
}

/** Logged-in org member with user id (required for stock audit). */
async function requireAuthContext(): Promise<{
  organizationId: string;
  userId: string;
}> {
  const session = await getSession();
  if (
    !session.isLoggedIn ||
    !session.organizationId ||
    !session.userId
  ) {
    redirect("/login");
  }
  return { organizationId: session.organizationId, userId: session.userId };
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const organizationId = await requireOrganizationId();
  const parsed = parseProductFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await createProductForOrganization(organizationId, parsed.data);
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      return {
        error: "A product with this SKU already exists for your organization",
      };
    }
    throw e;
  }

  redirect("/products?saved=created");
}

export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { organizationId, userId } = await requireAuthContext();
  const parsed = parseProductFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const updated = await updateProductForOrganization(
      organizationId,
      productId,
      parsed.data,
      { userId },
    );
    if (!updated) {
      return { error: "Product not found" };
    }
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      return {
        error: "A product with this SKU already exists for your organization",
      };
    }
    throw e;
  }

  redirect("/products?saved=updated");
}

export type DeleteProductResult = { ok: true } | { error: string };

export async function deleteProductAction(
  productId: string,
): Promise<DeleteProductResult> {
  const organizationId = await requireOrganizationId();
  const id = String(productId ?? "").trim();
  if (!id) {
    return { error: "Missing product" };
  }

  const deleted = await deleteProductForOrganization(organizationId, id);
  if (!deleted) {
    return { error: "Product not found" };
  }
  revalidatePath("/products");
  return { ok: true };
}

export type AdjustStockActionResult =
  | { ok: true; quantityOnHand: number }
  | { error: string };

export async function adjustStockAction(
  productId: string,
  formData: FormData,
): Promise<AdjustStockActionResult> {
  const { organizationId, userId } = await requireAuthContext();

  const parsed = parseAdjustStockFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const result = await adjustProductStock(
    organizationId,
    productId,
    parsed.delta,
    parsed.note,
    userId,
  );

  if (!result.ok) {
    if (result.reason === "not_found") {
      return { error: "Product not found" };
    }
    const q = result.quantityOnHand ?? 0;
    return {
      error: `Only ${q} on hand; this adjustment would go negative.`,
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}/edit`);
  return { ok: true, quantityOnHand: result.quantityOnHand };
}
