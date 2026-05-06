import { LowStockTable } from "@/components/dashboard/low-stock-table";
import {
  getOrganizationDefaultLowStock,
  listProductsByOrganization,
} from "@/lib/db/product-repository";
import { effectiveLowStockThreshold, isLowStock } from "@/lib/products/stock";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.organizationId) redirect("/login");

  const orgId = session.organizationId;
  const [products, orgDefaultLowStock] = await Promise.all([
    listProductsByOrganization(orgId),
    getOrganizationDefaultLowStock(orgId),
  ]);

  const totalProducts = products.length;
  let totalQuantityOnHand = 0;

  const lowStockRows: {
    id: string;
    name: string;
    sku: string;
    quantityOnHand: number;
    displayThreshold: string;
  }[] = [];

  for (const p of products) {
    const plain = p.get({ plain: true }) as {
      id: string;
      name: string;
      sku: string;
      quantityOnHand: number;
      lowStockThreshold: number | null;
    };
    totalQuantityOnHand += plain.quantityOnHand;

    const effective = effectiveLowStockThreshold(
      plain.lowStockThreshold,
      orgDefaultLowStock,
    );
    if (!isLowStock(plain.quantityOnHand, effective)) continue;

    const displayThreshold =
      plain.lowStockThreshold != null
        ? String(plain.lowStockThreshold)
        : `${orgDefaultLowStock} (default)`;

    lowStockRows.push({
      id: plain.id,
      name: plain.name,
      sku: plain.sku,
      quantityOnHand: plain.quantityOnHand,
      displayThreshold,
    });
  }

  lowStockRows.sort((a, b) => a.quantityOnHand - b.quantityOnHand);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      {session.email ? (
        <p className="text-foreground/55 mt-2 text-sm leading-relaxed">
          Signed in as {session.email}
        </p>
      ) : null}

      <section
        aria-label="Inventory summary"
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        <div className="border-default-200/90 bg-content1/70 hover:border-primary/25 shadow-sm ring-black/[0.03] transition-[box-shadow,border-color] hover:shadow-md dark:bg-content1/50 dark:ring-white/[0.05] rounded-xl border p-5 ring-1">
          <p className="text-foreground/55 text-xs font-semibold uppercase tracking-wider">
            Total products
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {totalProducts}
          </p>
        </div>
        <div className="border-default-200/90 bg-content1/70 hover:border-primary/25 shadow-sm ring-black/[0.03] transition-[box-shadow,border-color] hover:shadow-md dark:bg-content1/50 dark:ring-white/[0.05] rounded-xl border p-5 ring-1">
          <p className="text-foreground/55 text-xs font-semibold uppercase tracking-wider">
            Total quantity on hand
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {totalQuantityOnHand}
          </p>
        </div>
      </section>

      <section className="border-default-200/90 bg-content1/60 shadow-sm ring-black/[0.03] dark:bg-content1/40 dark:ring-white/[0.05] mt-10 overflow-hidden rounded-xl border ring-1">
        <div className="border-default-200/80 bg-linear-to-r from-default-100/50 to-transparent px-5 py-4 dark:from-default-100/10 dark:to-transparent border-b">
          <h2 className="text-lg font-semibold tracking-tight">
            Low stock items
          </h2>
          <p className="text-foreground/55 mt-1.5 max-w-3xl text-xs leading-relaxed">
            Quantity on hand is at or below the effective low stock threshold
            (product value or organization default {orgDefaultLowStock}).
          </p>
        </div>
        {lowStockRows.length === 0 ? (
          <p className="text-foreground/65 px-5 py-10 text-center text-sm">
            No low stock items right now.
          </p>
        ) : (
          <LowStockTable rows={lowStockRows} />
        )}
      </section>
    </main>
  );
}
