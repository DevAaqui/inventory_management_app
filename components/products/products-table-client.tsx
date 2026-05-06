"use client";

import { deleteProductAction } from "@/app/actions/products";
import { BulkUploadProductsButton } from "@/components/products/bulk-upload-products";
import type { SortDescriptor } from "@heroui/react";
import {
  AlertDialog,
  Button,
  Input,
  Table,
  buttonVariants,
  cn,
  inputVariants,
  toast,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function EditProductIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function DeleteProductIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

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
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s),
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Input
          aria-label="Filter by name or SKU"
          className={cn(
            inputVariants({ variant: "primary" }),
            "border-default-200/90 h-10 min-h-10 max-w-full shrink rounded-3xl px-4 text-sm shadow-none placeholder:text-foreground/45 sm:max-w-sm md:h-9 md:min-h-9",
          )}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or SKU…"
          value={q}
        />
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <BulkUploadProductsButton />
          <Link
            aria-label="Add product"
            className={cn(
              buttonVariants({ variant: "primary", size: "md" }),
              "no-underline shrink-0",
            )}
            href="/products/new"
          >
            <PlusIcon className="size-4 shrink-0" />
            Add
          </Link>
        </div>
      </div>

      <p className="text-foreground/55 text-xs leading-relaxed">
        Organization low-stock default when product threshold is empty:{" "}
        {orgDefaultLowStock}
      </p>

      <div className="border-default-200/90 dark:border-default-100 shadow-sm ring-black/[0.03] dark:ring-white/[0.05] overflow-x-auto rounded-xl border ring-1">
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
                    <SortHeader label="Selling" sortDirection={sortDirection} />
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
                        <>
                          <span className="text-danger font-medium">Low</span>
                          <span className="text-danger/65 ml-1 text-xs">
                            (≤ {p.effectiveThreshold})
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-success font-medium">OK</span>
                          <span className="text-success/65 ml-1 text-xs">
                            (≤ {p.effectiveThreshold})
                          </span>
                        </>
                      )}
                    </Table.Cell>
                    <Table.Cell>{formatMoney(p.sellingPrice)}</Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Link
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                              size: "sm",
                              isIconOnly: true,
                            }),
                            "no-underline text-foreground/65 hover:text-primary",
                          )}
                          href={`/products/${p.id}/edit`}
                          aria-label={`Edit ${p.name}`}
                        >
                          <EditProductIcon className="size-4 shrink-0" />
                        </Link>
                        <DeleteProductButton
                          productId={p.id}
                          productName={p.name}
                        />
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

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName?: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteProductAction(productId);
      if ("error" in result) {
        setDialogOpen(false);
        toast.danger("Could not delete product", {
          description: result.error,
        });
        return;
      }
      setDialogOpen(false);
      toast.success("Product deleted", {
        description: "It has been removed from your inventory.",
      });
      router.push("/products");
      router.refresh();
    } catch {
      setDialogOpen(false);
      toast.danger("Something went wrong", {
        description: "Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog isOpen={dialogOpen} onOpenChange={setDialogOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label={
          productName
            ? `Delete product ${productName}`
            : "Delete product"
        }
        className="text-danger hover:bg-danger/10 hover:text-danger data-[pressed]:bg-danger/15"
      >
        <DeleteProductIcon className="size-4 shrink-0" />
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
              <Button slot="close" variant="tertiary" isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                isDisabled={isDeleting}
                onPress={() => void handleConfirmDelete()}
              >
                {isDeleting ? "Deleting…" : "Delete product"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
