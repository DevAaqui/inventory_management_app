import { createProductAction } from "@/app/actions/products";
import { ProductForm } from "@/components/products/product-form";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          className="text-primary text-sm font-medium underline"
          href="/products"
        >
          ← Back to products
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New product</h1>
      </div>
      <ProductForm formAction={createProductAction} mode="create" />
    </main>
  );
}
