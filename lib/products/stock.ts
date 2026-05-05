/** Effective threshold for low-stock checks (FR-3: product override or org default). */
export function effectiveLowStockThreshold(
  productThreshold: number | null,
  organizationDefault: number,
): number {
  return productThreshold ?? organizationDefault;
}

export function isLowStock(quantityOnHand: number, threshold: number): boolean {
  return quantityOnHand <= threshold;
}
