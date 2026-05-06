import { createProductAction } from "@/app/actions/products";
import { ProductForm } from "@/components/products/product-form";
import Link from "next/link";

export default function NewProductPage() {
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
          New product
        </h1>
        <p className="text-foreground/55 mt-2 text-sm leading-relaxed">
          Add an item to your catalog with SKU and optional pricing.
        </p>
      </div>
      <ProductForm formAction={createProductAction} mode="create" />
    </main>
  );
}
