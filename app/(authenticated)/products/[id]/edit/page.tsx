import { updateProductAction } from "@/app/actions/products";
import { getUserEmailById } from "@/lib/db/auth-repository";
import { getProductForOrganization } from "@/lib/db/product-repository";
import { getSession } from "@/lib/session";
import { AdjustStockForm } from "@/components/products/adjust-stock-form";
import { ProductForm } from "@/components/products/product-form";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session.organizationId) redirect("/login");

  const product = await getProductForOrganization(session.organizationId, id);
  if (!product) notFound();

  const plain = product.get({ plain: true }) as unknown as {
    name: string;
    sku: string;
    description: string | null;
    quantityOnHand: number;
    costPrice: string | null;
    sellingPrice: string | null;
    lowStockThreshold: number | null;
    stockUpdatedAt: Date | string | null;
    stockUpdatedByUserId: string | null;
    stockUpdateNote: string | null;
    updatedAt: Date | string;
  };

  const stockUpdaterEmail = plain.stockUpdatedByUserId
    ? await getUserEmailById(plain.stockUpdatedByUserId)
    : null;

  const formKey = `${product.id}-${plain.quantityOnHand}-${
    plain.stockUpdatedAt != null ? String(plain.stockUpdatedAt) : "none"
  }-${String(plain.updatedAt)}`;

  const boundUpdate = updateProductAction.bind(null, product.id);

  const stockUpdatedLabel =
    plain.stockUpdatedAt != null
      ? new Date(plain.stockUpdatedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-12">
      <div className="mb-8">
        <Link
          className="text-foreground/70 hover:text-foreground hover:bg-default-100/90 -ml-2 inline-flex items-center rounded-lg px-2 py-1.5 text-sm font-medium transition-colors"
          href="/products"
        >
          ← Back to products
        </Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Edit product
        </h1>
        <p className="text-foreground/55 mt-2 text-sm leading-relaxed">
          Update details or adjust stock without leaving this page.
        </p>
      </div>
      <ProductForm
        key={formKey}
        defaultValues={{
          name: plain.name,
          sku: plain.sku,
          description: plain.description,
          quantityOnHand: plain.quantityOnHand,
          costPrice: plain.costPrice,
          sellingPrice: plain.sellingPrice,
          lowStockThreshold: plain.lowStockThreshold,
        }}
        formAction={boundUpdate}
        mode="edit"
      />

      <section className="border-default-200/90 bg-content1/70 shadow-md ring-black/[0.03] dark:bg-content1/45 dark:ring-white/[0.06] mt-10 rounded-2xl border p-6 ring-1 md:p-8">
        <h2 className="mb-1 text-lg font-semibold tracking-tight">
          Adjust stock
        </h2>
        <p className="text-foreground/60 mb-4 text-sm leading-relaxed">
          Change quantity by a relative amount without editing the full form.
          Who changed stock and when is recorded automatically.
        </p>
        {stockUpdatedLabel ? (
          <div className="text-foreground/70 mb-4 space-y-1 text-sm">
            <p>
              Last stock change:{" "}
              <span className="text-foreground">{stockUpdatedLabel}</span>
              {stockUpdaterEmail ? (
                <>
                  {" "}
                  by{" "}
                  <span className="text-foreground">{stockUpdaterEmail}</span>
                </>
              ) : null}
            </p>
            {plain.stockUpdateNote ? (
              <p>
                Note:{" "}
                <span className="text-foreground">{plain.stockUpdateNote}</span>
              </p>
            ) : null}
          </div>
        ) : null}
        <AdjustStockForm
          currentQuantityOnHand={plain.quantityOnHand}
          productId={product.id}
        />
      </section>
    </main>
  );
}
