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
import {
  isProductSortColumn,
  productsListHref,
  type ProductSortColumn,
} from "@/lib/products/products-list-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  totalCount,
  page,
  pageSize,
  q,
  sortColumn,
  sortDescending,
  orgDefaultLowStock,
}: {
  products: ProductRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  q: string;
  sortColumn: ProductSortColumn;
  sortDescending: boolean;
  orgDefaultLowStock: number;
}) {
  const router = useRouter();
  const [qInput, setQInput] = useState(q);

  const patchHref = (patch: Partial<{
    page: number;
    q: string;
    sortColumn: ProductSortColumn;
    sortDescending: boolean;
  }>) =>
    productsListHref({
      page,
      q,
      sortColumn,
      sortDescending,
      ...patch,
    });

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (qInput.trim() === q.trim()) return;
      router.replace(
        productsListHref({
          page: 1,
          q: qInput,
          sortColumn,
          sortDescending,
        }),
        { scroll: false },
      );
    }, 450);
    return () => window.clearTimeout(id);
  }, [qInput, q, router, sortColumn, sortDescending]);

  const sortDescriptor = useMemo<SortDescriptor>(
    () => ({
      column: sortColumn,
      direction: sortDescending ? "descending" : "ascending",
    }),
    [sortColumn, sortDescending],
  );

  function handleSortChange(desc: SortDescriptor) {
    const col = String(desc.column);
    if (!isProductSortColumn(col)) return;
    router.push(
      patchHref({
        sortColumn: col,
        sortDescending: desc.direction === "descending",
        page: 1,
      }),
      { scroll: false },
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeFrom =
    totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, totalCount);

  const emptyMessage =
    totalCount === 0 && !q.trim()
      ? "No products yet. Add your first one."
      : "No matches for this search.";

  const prevHref = patchHref({ page: page - 1 });
  const nextHref = patchHref({ page: page + 1 });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Input
          aria-label="Filter by name or SKU"
          className={cn(
            inputVariants({ variant: "primary" }),
            "border-default-200/90 h-10 min-h-10 max-w-full shrink rounded-3xl px-4 text-sm shadow-none placeholder:text-foreground/45 sm:max-w-sm md:h-9 md:min-h-9",
          )}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search name or SKU…"
          value={qInput}
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

      <div className="text-foreground/65 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          {totalCount === 0
            ? q.trim()
              ? "No matching products."
              : "No products yet."
            : `Showing ${rangeFrom}–${rangeTo} of ${totalCount}`}
        </p>
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center gap-2"
        >
          <Link
            aria-disabled={page <= 1}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "no-underline",
              page <= 1 && "pointer-events-none opacity-45",
            )}
            href={prevHref}
            scroll={false}
          >
            Previous
          </Link>
          <span className="text-foreground/55 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Link
            aria-disabled={page >= totalPages}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "no-underline",
              page >= totalPages && "pointer-events-none opacity-45",
            )}
            href={nextHref}
            scroll={false}
          >
            Next
          </Link>
        </nav>
      </div>

      <div className="border-default-200/90 dark:border-default-100 shadow-sm ring-black/[0.03] dark:ring-white/[0.05] overflow-x-auto rounded-xl border ring-1">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Products"
              className="min-w-[640px]"
              onSortChange={handleSortChange}
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
                {products.map((p) => (
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
