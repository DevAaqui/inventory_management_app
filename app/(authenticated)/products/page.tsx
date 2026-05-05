import {
  getOrganizationDefaultLowStock,
  listProductsByOrganization,
} from "@/lib/db/product-repository";
import { effectiveLowStockThreshold, isLowStock } from "@/lib/products/stock";
import { getSession } from "@/lib/session";
import {
  ProductsTableClient,
  type ProductRow,
} from "@/components/products/products-table-client";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session.organizationId) redirect("/login");

  const orgId = session.organizationId;
  const [products, orgDefault] = await Promise.all([
    listProductsByOrganization(orgId),
    getOrganizationDefaultLowStock(orgId),
  ]);

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Products</h1>
      <ProductsTableClient
        orgDefaultLowStock={orgDefault}
        products={rows}
      />
    </main>
  );
}
