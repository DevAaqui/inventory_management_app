import type { CreateProductInput } from "@/lib/db/product-repository";

/**
 * Create/update product FormData → validated {@link CreateProductInput} (shared rules for forms and XLSX rows).
 */
export function parseProductFormData(formData: FormData):
  | { ok: true; data: CreateProductInput }
  | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Name is required" };
  }
  if (name.length > 255) {
    return { ok: false, error: "Name is too long" };
  }

  const sku = String(formData.get("sku") ?? "").trim();
  if (!sku) {
    return { ok: false, error: "SKU is required" };
  }
  if (sku.length > 128) {
    return { ok: false, error: "SKU is too long" };
  }

  let description: string | null = String(
    formData.get("description") ?? "",
  ).trim();
  if (!description) description = null;
  if (description && description.length > 10000) {
    return { ok: false, error: "Description is too long" };
  }

  const qtyRaw = String(formData.get("quantityOnHand") ?? "");
  const quantityOnHand = Number.parseInt(qtyRaw, 10);
  if (!Number.isFinite(quantityOnHand) || quantityOnHand < 0) {
    return { ok: false, error: "Quantity must be a non-negative whole number" };
  }

  let costPrice: string | null = null;
  const costRaw = String(formData.get("costPrice") ?? "").trim();
  if (costRaw !== "") {
    const c = Number(costRaw);
    if (!Number.isFinite(c) || c < 0) {
      return { ok: false, error: "Cost price must be a non-negative number" };
    }
    costPrice = c.toFixed(2);
  }

  let sellingPrice: string | null = null;
  const sellRaw = String(formData.get("sellingPrice") ?? "").trim();
  if (sellRaw !== "") {
    const s = Number(sellRaw);
    if (!Number.isFinite(s) || s < 0) {
      return {
        ok: false,
        error: "Selling price must be a non-negative number",
      };
    }
    sellingPrice = s.toFixed(2);
  }

  let lowStockThreshold: number | null = null;
  const lowRaw = String(formData.get("lowStockThreshold") ?? "").trim();
  if (lowRaw !== "") {
    const low = Number.parseInt(lowRaw, 10);
    if (!Number.isFinite(low) || low < 0) {
      return {
        ok: false,
        error: "Low stock threshold must be a non-negative whole number",
      };
    }
    lowStockThreshold = low;
  }

  return {
    ok: true,
    data: {
      name,
      sku,
      description,
      quantityOnHand,
      costPrice,
      sellingPrice,
      lowStockThreshold,
    },
  };
}
