/**
 * Low-stock rules: effective threshold per product vs org default (FR-3).
 */

/** Threshold for alerts: product override when set, otherwise organization default. */
export function effectiveLowStockThreshold(
  productThreshold: number | null,
  organizationDefault: number,
): number {
  return productThreshold ?? organizationDefault;
}

/** True when on-hand quantity is at or below the (effective) threshold. */
export function isLowStock(quantityOnHand: number, threshold: number): boolean {
  return quantityOnHand <= threshold;
}
