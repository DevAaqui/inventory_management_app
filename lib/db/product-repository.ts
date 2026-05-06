import { literal, Op, type ModelStatic, type OrderItem, type WhereOptions } from "sequelize";
import { getSequelize } from "./sequelize";
import type { ProductSortColumn } from "@/lib/products/products-list-query";
import type { Organization } from "./models/organization";
import type { Product } from "./models/product";

/** Use Sequelize-registered models so queries always hit the class that `initModels` wired up (avoids duplicate-module / Turbopack issues). */
function organizationModel(): ModelStatic<Organization> {
  return getSequelize().model("Organization") as ModelStatic<Organization>;
}

function productModel(): ModelStatic<Product> {
  return getSequelize().model("Product") as ModelStatic<Product>;
}

/**
 * Stock audit columns are written with raw SQL so updates survive a stale `Product` model on the
 * Sequelize singleton (Next.js / Turbopack HMR can leave `initModels` from an older bundle, so
 * Sequelize omits attributes it does not know about from `Model#update`).
 */
async function sqlStampProductStockAudit(params: {
  productId: string;
  organizationId: string;
  userId: string;
  note: string | null;
  at: Date;
}): Promise<void> {
  const { productId, organizationId, userId, note, at } = params;
  await getSequelize().query(
    `UPDATE products
     SET stock_updated_at = ?, stock_updated_by_user_id = ?, stock_update_note = ?, updated_at = ?
     WHERE id = ? AND organization_id = ?`,
    {
      replacements: [at, userId, note, at, productId, organizationId],
    },
  );
}

async function sqlAdjustProductStockRow(params: {
  productId: string;
  organizationId: string;
  nextQty: number;
  userId: string;
  note: string | null;
  at: Date;
}): Promise<number> {
  const { productId, organizationId, nextQty, userId, note, at } = params;
  const rows = await getSequelize().query(
    `UPDATE products
     SET quantity_on_hand = ?, stock_updated_at = ?, stock_updated_by_user_id = ?,
         stock_update_note = ?, updated_at = ?
     WHERE id = ? AND organization_id = ?`,
    {
      replacements: [nextQty, at, userId, note, at, productId, organizationId],
    },
  );
  // `sequelize.query` defaults to RAW: MySQL driver returns OkPacket / ResultSetHeader as first tuple value.
  const header = rows[0] as { affectedRows?: number } | undefined;
  return header?.affectedRows ?? 0;
}

export async function getOrganizationDefaultLowStock(
  organizationId: string,
): Promise<number> {
  const org = await organizationModel().findByPk(organizationId, {
    attributes: ["defaultLowStockThreshold"],
  });
  return org?.defaultLowStockThreshold ?? 5;
}

export async function updateOrganizationDefaultLowStock(
  organizationId: string,
  defaultLowStockThreshold: number,
): Promise<boolean> {
  const org = await organizationModel().findByPk(organizationId);
  if (!org) return false;
  await org.update({ defaultLowStockThreshold });
  return true;
}

export async function listProductsByOrganization(
  organizationId: string,
): Promise<Product[]> {
  return productModel().findAll({
    where: { organizationId },
    // Unqualified column avoids bad SQL when Sequelize aliases the table (e.g. subqueries).
    order: literal("`updated_at` DESC"),
  });
}

/** Paginated listing with optional name/SKU search and sort (for `/products`). */
export async function listProductsByOrganizationPaginated(params: {
  organizationId: string;
  orgDefaultLowStock: number;
  limit: number;
  offset: number;
  search: string;
  sortColumn: ProductSortColumn;
  sortDescending: boolean;
}): Promise<{ rows: Product[]; total: number }> {
  const {
    organizationId,
    orgDefaultLowStock,
    limit,
    offset,
    search,
    sortColumn,
    sortDescending,
  } = params;

  const where: WhereOptions<Product> = { organizationId };
  const term = search
    .trim()
    .replace(/\\/g, "")
    .replace(/%/g, "")
    .replace(/_/g, "")
    .slice(0, 200);
  if (term.length > 0) {
    Object.assign(where, {
      [Op.or]: [
        { name: { [Op.like]: `%${term}%` } },
        { sku: { [Op.like]: `%${term}%` } },
      ],
    });
  }

  const dir = sortDescending ? "DESC" : "ASC";
  const thr = Number.isFinite(orgDefaultLowStock)
    ? Math.min(Math.max(0, Math.floor(orgDefaultLowStock)), 2_147_483_647)
    : 5;

  let primaryOrder: OrderItem[];

  switch (sortColumn) {
    case "name":
      primaryOrder = [["name", dir]];
      break;
    case "sku":
      primaryOrder = [["sku", dir]];
      break;
    case "quantityOnHand":
      primaryOrder = [["quantityOnHand", dir]];
      break;
    case "sellingPrice":
      primaryOrder = [
        [literal("(selling_price IS NULL)"), "ASC"],
        ["sellingPrice", dir],
      ];
      break;
    case "isLowStock":
      primaryOrder = [
        [
          literal(
            `(quantity_on_hand <= COALESCE(low_stock_threshold, ${thr}))`,
          ),
          dir,
        ],
      ];
      break;
    default:
      primaryOrder = [["name", "ASC"]];
  }

  const { rows, count } = await productModel().findAndCountAll({
    where,
    limit,
    offset,
    order: [...primaryOrder, ["id", "ASC"]],
  });

  return { rows, total: count };
}

export async function getProductForOrganization(
  organizationId: string,
  productId: string,
): Promise<Product | null> {
  return productModel().findOne({
    where: { id: productId, organizationId },
  });
}

export type CreateProductInput = {
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: string | null;
  sellingPrice: string | null;
  lowStockThreshold: number | null;
};

export type UpdateProductInput = CreateProductInput;

export async function createProductForOrganization(
  organizationId: string,
  input: CreateProductInput,
): Promise<Product> {
  return productModel().create({
    organizationId,
    name: input.name,
    sku: input.sku,
    description: input.description,
    quantityOnHand: input.quantityOnHand,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    lowStockThreshold: input.lowStockThreshold,
  });
}

/** SKUs in this organization that intersect `skus` (exact order not preserved). */
export async function findExistingProductSkus(
  organizationId: string,
  skus: string[],
): Promise<string[]> {
  if (skus.length === 0) {
    return [];
  }
  const rows = await productModel().findAll({
    where: { organizationId, sku: { [Op.in]: skus } },
    attributes: ["sku"],
    raw: true,
  });
  return (rows as { sku: string }[]).map((r) => r.sku);
}

export async function bulkCreateProductsForOrganization(
  organizationId: string,
  inputs: CreateProductInput[],
): Promise<number> {
  const sequelize = getSequelize();
  await sequelize.transaction(async (transaction) => {
    for (const input of inputs) {
      await productModel().create(
        {
          organizationId,
          name: input.name,
          sku: input.sku,
          description: input.description,
          quantityOnHand: input.quantityOnHand,
          costPrice: input.costPrice,
          sellingPrice: input.sellingPrice,
          lowStockThreshold: input.lowStockThreshold,
        },
        { transaction },
      );
    }
  });
  return inputs.length;
}

export type UpdateProductOptions = {
  /** When quantity on hand changes, audit columns are set if `userId` is set. */
  userId?: string;
};

export async function updateProductForOrganization(
  organizationId: string,
  productId: string,
  input: UpdateProductInput,
  options?: UpdateProductOptions,
): Promise<Product | null> {
  const product = await productModel().findOne({
    where: { id: productId, organizationId },
  });
  if (!product) return null;

  const prevQty = product.quantityOnHand;
  const qtyChanged = prevQty !== input.quantityOnHand;

  await product.update({
    name: input.name,
    sku: input.sku,
    description: input.description,
    quantityOnHand: input.quantityOnHand,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    lowStockThreshold: input.lowStockThreshold,
  });

  if (qtyChanged && options?.userId) {
    await sqlStampProductStockAudit({
      productId,
      organizationId,
      userId: options.userId,
      note: null,
      at: new Date(),
    });
  }

  return product;
}

export type AdjustStockResult =
  | { ok: true; quantityOnHand: number }
  | { ok: false; reason: "not_found" | "insufficient"; quantityOnHand?: number };

export async function adjustProductStock(
  organizationId: string,
  productId: string,
  delta: number,
  note: string | null,
  userId: string,
): Promise<AdjustStockResult> {
  const product = await productModel().findOne({
    where: { id: productId, organizationId },
  });
  if (!product) return { ok: false, reason: "not_found" };

  const current = product.quantityOnHand;
  const next = current + delta;
  if (next < 0) {
    return { ok: false, reason: "insufficient", quantityOnHand: current };
  }

  const now = new Date();
  const affected = await sqlAdjustProductStockRow({
    productId,
    organizationId,
    nextQty: next,
    userId,
    note,
    at: now,
  });

  if (affected === 0) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, quantityOnHand: next };
}

export async function deleteProductForOrganization(
  organizationId: string,
  productId: string,
): Promise<boolean> {
  const n = await productModel().destroy({
    where: { id: productId, organizationId },
  });
  return n > 0;
}
