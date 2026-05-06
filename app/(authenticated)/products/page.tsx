import { Suspense } from "react";
import {
  getOrganizationDefaultLowStock,
  listProductsByOrganizationPaginated,
} from "@/lib/db/product-repository";
import { effectiveLowStockThreshold, isLowStock } from "@/lib/products/stock";
import {
  PRODUCTS_PAGE_SIZE,
  parseProductsListQuery,
  productsListHref,
} from "@/lib/products/products-list-query";
import { getSession } from "@/lib/session";
import { ProductsSavedToast } from "@/components/products/products-saved-toast";
import {
  ProductsTableClient,
  type ProductRow,
} from "@/components/products/products-table-client";
import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session.organizationId) redirect("/login");

  const orgId = session.organizationId;
  const raw = await searchParams;
  const parsed = parseProductsListQuery(raw);

  const orgDefault = await getOrganizationDefaultLowStock(orgId);

  const firstBatch = await listProductsByOrganizationPaginated({
    organizationId: orgId,
    orgDefaultLowStock: orgDefault,
    limit: PRODUCTS_PAGE_SIZE,
    offset: (parsed.page - 1) * PRODUCTS_PAGE_SIZE,
    search: parsed.q,
    sortColumn: parsed.sortColumn,
    sortDescending: parsed.sortDescending,
  });

  const { total, rows: products } = firstBatch;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const page =
    total === 0 ? 1 : Math.min(Math.max(1, parsed.page), totalPages);

  if (parsed.page !== page) {
    redirect(productsListHref({ ...parsed, page }));
  }

  const rows: ProductRow[] = products.map((p) => {
    const plain = p.get({ plain: true }) as {
      id: string;
      name: string;
      sku: string;
      quantityOnHand: number;
      sellingPrice: string | null;
      lowStockThreshold: number | null;
    };
    const eff = effectiveLowStockThreshold(
      plain.lowStockThreshold,
      orgDefault,
    );
    return {
      id: plain.id,
      name: plain.name,
      sku: plain.sku,
      quantityOnHand: plain.quantityOnHand,
      sellingPrice: plain.sellingPrice,
      effectiveThreshold: eff,
      isLowStock: isLowStock(plain.quantityOnHand, eff),
    };
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-12">
      <Suspense fallback={null}>
        <ProductsSavedToast />
      </Suspense>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">Products</h1>
      <p className="text-foreground/55 mb-8 text-sm leading-relaxed">
        Manage catalog, quantities, and low-stock alerts for your organization.
      </p>
      <ProductsTableClient
        key={`${parsed.q}|${page}|${parsed.sortColumn}|${String(parsed.sortDescending)}`}
        orgDefaultLowStock={orgDefault}
        page={page}
        pageSize={PRODUCTS_PAGE_SIZE}
        products={rows}
        q={parsed.q}
        sortColumn={parsed.sortColumn}
        sortDescending={parsed.sortDescending}
        totalCount={total}
      />
    </main>
  );
}
