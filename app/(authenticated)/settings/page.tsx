import { DefaultLowStockForm } from "@/components/settings/default-low-stock-form";
import { getOrganizationDefaultLowStock } from "@/lib/db/product-repository";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session.organizationId) redirect("/login");

  const defaultLowStock = await getOrganizationDefaultLowStock(
    session.organizationId,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-foreground/60 mt-1 text-sm">
        Organization-wide defaults for StockFlow
      </p>
      <div className="mt-8">
        <DefaultLowStockForm
          key={defaultLowStock}
          initialDefaultLowStock={defaultLowStock}
        />
      </div>
    </main>
  );
}
