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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-foreground/55 mt-2 text-sm leading-relaxed">
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
