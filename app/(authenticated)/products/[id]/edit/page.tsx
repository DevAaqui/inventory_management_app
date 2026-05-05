import { updateProductAction } from "@/app/actions/products";
import { getProductForOrganization } from "@/lib/db/product-repository";
import { getSession } from "@/lib/session";
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

  const plain = product.get({ plain: true }) as {
    name: string;
    sku: string;
    description: string | null;
    quantityOnHand: number;
    costPrice: string | null;
    sellingPrice: string | null;
    lowStockThreshold: number | null;
  };

  const boundUpdate = updateProductAction.bind(null, product.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          className="text-primary text-sm font-medium underline"
          href="/products"
        >
          ← Back to products
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit product</h1>
      </div>
      <ProductForm
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
    </main>
  );
}
