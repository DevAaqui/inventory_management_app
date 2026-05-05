"use client";

import { deleteProductFormAction } from "@/app/actions/products";
import type { SortDescriptor } from "@heroui/react";
import { AlertDialog, Button, Input, Table, cn } from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
  sellingPrice: string | null;
  effectiveThreshold: number;
  isLowStock: boolean;
};

function formatMoney(v: string | null): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function sellingPriceSortValue(v: string | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Null / missing prices sort last in both directions */
function compareSellingPrice(
  a: string | null,
  b: string | null,
  descending: boolean,
): number {
  const av = sellingPriceSortValue(a);
  const bv = sellingPriceSortValue(b);
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  const base = av - bv;
  return descending ? -base : base;
}

function sortProductRows(
  rows: ProductRow[],
  descriptor: SortDescriptor,
): ProductRow[] {
  const col = String(descriptor.column);
  const dir = descriptor.direction === "descending";
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (col) {
      case "name":
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        break;
      case "sku":
        cmp = a.sku.localeCompare(b.sku, undefined, { sensitivity: "base" });
        break;
      case "quantityOnHand":
        cmp = a.quantityOnHand - b.quantityOnHand;
        break;
      case "isLowStock":
        cmp = Number(a.isLowStock) - Number(b.isLowStock);
        break;
      case "sellingPrice":
        return compareSellingPrice(a.sellingPrice, b.sellingPrice, dir);
      default:
        return 0;
    }
    return dir ? -cmp : cmp;
  });
}

function SortHeader({
  label,
  sortDirection,
}: {
  label: string;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span
      className={cn(
        "flex w-full min-w-0 items-center justify-between gap-2",
        sortDirection && "font-medium",
      )}
    >
      <span className="truncate">{label}</span>
      {sortDirection ? (
        <span className="text-foreground/60 shrink-0 text-[10px]" aria-hidden>
          {sortDirection === "ascending" ? "▲" : "▼"}
        </span>
      ) : null}
    </span>
  );
}

export function ProductsTableClient({
  products,
  orgDefaultLowStock,
}: {
  products: ProductRow[];
  orgDefaultLowStock: number;
}) {
  const [q, setQ] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s),
    );
  }, [products, q]);

  const sorted = useMemo(
    () => sortProductRows(filtered, sortDescriptor),
    [filtered, sortDescriptor],
  );

  const emptyMessage =
    products.length === 0
      ? "No products yet. Add your first one."
      : "No matches for this search.";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          aria-label="Filter by name or SKU"
          className="max-w-sm"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or SKU…"
          value={q}
        />
        <Link
          className="bg-foreground text-background hover:opacity-90 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold"
          href="/products/new"
        >
          Add product
        </Link>
      </div>

      <p className="text-foreground/60 text-xs">
        Organization low-stock default when product threshold is empty:{" "}
        {orgDefaultLowStock}
      </p>

      <div className="border-default-200 dark:border-default-100 overflow-x-auto rounded-lg border">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Products"
              className="min-w-[640px]"
              onSortChange={setSortDescriptor}
              sortDescriptor={sortDescriptor}
            >
              <Table.Header>
                <Table.Column allowsSorting id="name" isRowHeader>
                  {({ sortDirection }) => (
                    <SortHeader label="Name" sortDirection={sortDirection} />
                  )}
                </Table.Column>
                <Table.Column allowsSorting id="sku">
                  {({ sortDirection }) => (
                    <SortHeader label="SKU" sortDirection={sortDirection} />
                  )}
                </Table.Column>
                <Table.Column allowsSorting id="quantityOnHand">
                  {({ sortDirection }) => (
                    <SortHeader label="Qty" sortDirection={sortDirection} />
                  )}
                </Table.Column>
                <Table.Column allowsSorting id="isLowStock">
                  {({ sortDirection }) => (
                    <SortHeader
                      label="Low stock"
                      sortDirection={sortDirection}
                    />
                  )}
                </Table.Column>
                <Table.Column allowsSorting id="sellingPrice">
                  {({ sortDirection }) => (
                    <SortHeader
                      label="Selling"
                      sortDirection={sortDirection}
                    />
                  )}
                </Table.Column>
                <Table.Column className="text-right">Actions</Table.Column>
              </Table.Header>
              <Table.Body renderEmptyState={() => emptyMessage}>
                {sorted.map((p) => (
                  <Table.Row id={p.id} key={p.id}>
                    <Table.Cell className="font-medium">{p.name}</Table.Cell>
                    <Table.Cell className="text-foreground/80">
                      {p.sku}
                    </Table.Cell>
                    <Table.Cell>{p.quantityOnHand}</Table.Cell>
                    <Table.Cell>
                      {p.isLowStock ? (
                        <span className="text-danger font-medium">Low</span>
                      ) : (
                        <span className="text-foreground/50">OK</span>
                      )}
                      <span className="text-foreground/50 ml-1 text-xs">
                        (≤ {p.effectiveThreshold})
                      </span>
                    </Table.Cell>
                    <Table.Cell>{formatMoney(p.sellingPrice)}</Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        <Link
                          className="text-primary text-xs font-medium underline"
                          href={`/products/${p.id}/edit`}
                        >
                          Edit
                        </Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}

export function DeleteProductButton({ productId }: { productId: string }) {
  const formId = `delete-product-${productId}`;
  return (
    <>
      <AlertDialog>
        <Button
          type="button"
          variant="tertiary"
          className="text-danger hover:text-danger h-auto min-h-0 px-0 py-0 text-xs font-medium underline"
        >
          Delete
        </Button>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete this product?</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="text-foreground/80 text-sm">
                  This will permanently remove the product from your inventory.
                  This action cannot be undone.
                </p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button form={formId} type="submit" variant="danger">
                  Delete product
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
      <form id={formId} action={deleteProductFormAction} hidden>
        <input name="id" type="hidden" value={productId} />
      </form>
    </>
  );
}
