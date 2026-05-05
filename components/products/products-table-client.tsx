"use client";

import { deleteProductFormAction } from "@/app/actions/products";
import { Button, Input } from "@heroui/react";
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

export function ProductsTableClient({
  products,
  orgDefaultLowStock,
}: {
  products: ProductRow[];
  orgDefaultLowStock: number;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s),
    );
  }, [products, q]);

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
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-content2/50 border-b border-default-200 text-foreground/80">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Low stock</th>
              <th className="px-3 py-2 font-medium">Selling</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  className="text-foreground/60 px-3 py-6 text-center"
                  colSpan={6}
                >
                  {products.length === 0
                    ? "No products yet. Add your first one."
                    : "No matches for this search."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  className="border-default-100 border-b last:border-0"
                  key={p.id}
                >
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="text-foreground/80 px-3 py-2">{p.sku}</td>
                  <td className="px-3 py-2">{p.quantityOnHand}</td>
                  <td className="px-3 py-2">
                    {p.isLowStock ? (
                      <span className="text-danger font-medium">Low</span>
                    ) : (
                      <span className="text-foreground/50">OK</span>
                    )}
                    <span className="text-foreground/50 ml-1 text-xs">
                      (≤ {p.effectiveThreshold})
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatMoney(p.sellingPrice)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      className="text-primary text-xs font-medium underline"
                      href={`/products/${p.id}/edit`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <form
      action={deleteProductFormAction}
      onSubmit={(e) => {
        if (
          !confirm(
            "Delete this product? This cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={productId} />
      <Button type="submit" variant="danger">
        Delete product
      </Button>
    </form>
  );
}
