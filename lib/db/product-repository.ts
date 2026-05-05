import { literal, type ModelStatic } from "sequelize";
import { getSequelize } from "./sequelize";
import type { Organization } from "./models/organization";
import type { Product } from "./models/product";

/** Use Sequelize-registered models so queries always hit the class that `initModels` wired up (avoids duplicate-module / Turbopack issues). */
function organizationModel(): ModelStatic<Organization> {
  return getSequelize().model("Organization") as ModelStatic<Organization>;
}

function productModel(): ModelStatic<Product> {
  return getSequelize().model("Product") as ModelStatic<Product>;
}

export async function getOrganizationDefaultLowStock(
  organizationId: string,
): Promise<number> {
  const org = await organizationModel().findByPk(organizationId, {
    attributes: ["defaultLowStockThreshold"],
  });
  return org?.defaultLowStockThreshold ?? 5;
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

export async function updateProductForOrganization(
  organizationId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<Product | null> {
  const product = await productModel().findOne({
    where: { id: productId, organizationId },
  });
  if (!product) return null;
  await product.update({
    name: input.name,
    sku: input.sku,
    description: input.description,
    quantityOnHand: input.quantityOnHand,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    lowStockThreshold: input.lowStockThreshold,
  });
  return product;
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
