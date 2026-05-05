"use server";

import { revalidatePath } from "next/cache";
import { UniqueConstraintError } from "sequelize";
import { redirect } from "next/navigation";
import { parseProductFormData } from "@/lib/products/parse-product-form";
import {
  createProductForOrganization,
  deleteProductForOrganization,
  updateProductForOrganization,
} from "@/lib/db/product-repository";
import { getSession } from "@/lib/session";

export type ProductActionState = { error?: string };

async function requireOrganizationId(): Promise<string> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.organizationId) {
    redirect("/login");
  }
  return session.organizationId;
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

  redirect("/products");
}

export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const organizationId = await requireOrganizationId();
  const parsed = parseProductFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    const updated = await updateProductForOrganization(
      organizationId,
      productId,
      parsed.data,
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

  redirect("/products");
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
