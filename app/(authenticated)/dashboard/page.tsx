import { LowStockTable } from "@/components/dashboard/low-stock-table";
import {
  getOrganizationDefaultLowStock,
  listProductsByOrganization,
} from "@/lib/db/product-repository";
import { effectiveLowStockThreshold, isLowStock } from "@/lib/products/stock";
import { getSession } from "@/lib/session";
import { Card } from "@heroui/react";
import { redirect } from "next/navigation";

const dashboardCardElevation =
  "shadow-xl shadow-black/[0.08] dark:shadow-black/[0.48]";

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
        <Card className={dashboardCardElevation}>
          <Card.Content>
            <p className="text-foreground/55 text-xs font-semibold uppercase tracking-wider">
              Total products
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {totalProducts}
            </p>
          </Card.Content>
        </Card>
        <Card className={dashboardCardElevation}>
          <Card.Content>
            <p className="text-foreground/55 text-xs font-semibold uppercase tracking-wider">
              Total quantity on hand
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {totalQuantityOnHand}
            </p>
          </Card.Content>
        </Card>
      </section>

      <Card className={`mt-10 ${dashboardCardElevation}`}>
        <Card.Header>
          <Card.Title className="text-lg font-semibold tracking-tight">
            Low stock items
          </Card.Title>
          <Card.Description className="text-foreground/55 mt-1.5 max-w-3xl text-xs leading-relaxed">
            Quantity on hand is at or below the effective low stock threshold
            (product value or organization default {orgDefaultLowStock}).
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {lowStockRows.length === 0 ? (
            <p className="text-foreground/65 py-6 text-center text-sm">
              No low stock items right now.
            </p>
          ) : (
            <LowStockTable rows={lowStockRows} />
          )}
        </Card.Content>
      </Card>
    </main>
  );
}
