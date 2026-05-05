import { literal } from "sequelize";
import { getSequelize } from "./sequelize";
import { Organization } from "./models/organization";
import { Product } from "./models/product";

export async function getOrganizationDefaultLowStock(
  organizationId: string,
): Promise<number> {
  getSequelize();
  const org = await Organization.findByPk(organizationId, {
    attributes: ["defaultLowStockThreshold"],
  });
  return org?.defaultLowStockThreshold ?? 5;
}

export async function listProductsByOrganization(
  organizationId: string,
): Promise<Product[]> {
  getSequelize();
  return Product.findAll({
    where: { organizationId },
    // Unqualified column avoids bad SQL when Sequelize aliases the table (e.g. subqueries).
    order: literal("`updated_at` DESC"),
  });
}

export async function getProductForOrganization(
  organizationId: string,
  productId: string,
): Promise<Product | null> {
  getSequelize();
  return Product.findOne({
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
  getSequelize();
  return Product.create({
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
  getSequelize();
  const product = await Product.findOne({
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
  getSequelize();
  const n = await Product.destroy({
    where: { id: productId, organizationId },
  });
  return n > 0;
}
