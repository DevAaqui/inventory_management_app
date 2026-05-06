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
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {session.email ? (
        <p className="text-foreground/60 mt-1 text-sm">
          Signed in as {session.email}
        </p>
      ) : null}

      <section
        aria-label="Inventory summary"
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        <div className="border-default-200 rounded-lg border p-4">
          <p className="text-foreground/60 text-sm font-medium">
            Total products
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {totalProducts}
          </p>
        </div>
        <div className="border-default-200 rounded-lg border p-4">
          <p className="text-foreground/60 text-sm font-medium">
            Total quantity on hand
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {totalQuantityOnHand}
          </p>
        </div>
      </section>

      <section className="border-default-200 mt-10 rounded-lg border">
        <div className="border-default-200 border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Low stock items</h2>
          <p className="text-foreground/60 mt-0.5 text-xs">
            Quantity on hand is at or below the effective low stock threshold
            (product value or organization default {orgDefaultLowStock}).
          </p>
        </div>
        {lowStockRows.length === 0 ? (
          <p className="text-foreground/70 px-4 py-6 text-sm">
            No low stock items right now.
          </p>
        ) : (
          <LowStockTable rows={lowStockRows} />
        )}
      </section>
    </main>
  );
}
