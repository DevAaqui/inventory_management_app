"use client";

import { type ProductActionState } from "@/app/actions/products";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState } from "react";

type Props = {
  mode: "create" | "edit";
  defaultValues?: {
    name: string;
    sku: string;
    description: string | null;
    quantityOnHand: number;
    costPrice: string | null;
    sellingPrice: string | null;
    lowStockThreshold: number | null;
  };
  formAction: (
    prev: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
};

const initial: ProductActionState = {};

export function ProductForm({ mode, defaultValues, formAction }: Props) {
  const [state, action, pending] = useActionState(formAction, initial);

  const d = defaultValues;

  return (
    <Form className="flex max-w-xl flex-col gap-4" action={action}>
      {state.error ? (
        <p className="text-danger text-sm font-medium" role="alert">
          {state.error}
        </p>
      ) : null}

      <TextField
        isRequired
        name="name"
        defaultValue={d?.name ?? ""}
        validate={(v) => (v.trim().length > 0 ? null : "Name is required")}
      >
        <Label>Name</Label>
        <Input placeholder="Product name" />
        <FieldError />
      </TextField>

      <TextField
        isRequired
        name="sku"
        defaultValue={d?.sku ?? ""}
        validate={(v) => (v.trim().length > 0 ? null : "SKU is required")}
      >
        <Label>SKU</Label>
        <Input placeholder="SKU-001" />
        <FieldError />
      </TextField>

      <div className="flex flex-col gap-2">
        <Label>Description (optional)</Label>
        <TextArea
          className="border-default-200 focus:border-primary min-h-[100px] w-full rounded-lg border px-3 py-2 text-sm outline-none"
          name="description"
          defaultValue={d?.description ?? ""}
          placeholder="Optional details"
        />
      </div>

      <TextField
        isRequired
        name="quantityOnHand"
        defaultValue={d?.quantityOnHand?.toString() ?? "0"}
        validate={(v) => {
          const n = Number.parseInt(v, 10);
          return Number.isFinite(n) && n >= 0
            ? null
            : "Non-negative whole number";
        }}
      >
        <Label>Quantity on hand</Label>
        <Input inputMode="numeric" placeholder="0" />
        <FieldError />
      </TextField>

      <TextField
        name="costPrice"
        defaultValue={
          d?.costPrice != null ? String(d.costPrice) : ""
        }
        validate={(v) => {
          const t = v.trim();
          if (!t) return null;
          const n = Number(t);
          return Number.isFinite(n) && n >= 0
            ? null
            : "Non-negative number";
        }}
      >
        <Label>Cost price (optional)</Label>
        <Input inputMode="decimal" placeholder="0.00" />
        <FieldError />
      </TextField>

      <TextField
        name="sellingPrice"
        defaultValue={
          d?.sellingPrice != null ? String(d.sellingPrice) : ""
        }
        validate={(v) => {
          const t = v.trim();
          if (!t) return null;
          const n = Number(t);
          return Number.isFinite(n) && n >= 0
            ? null
            : "Non-negative number";
        }}
      >
        <Label>Selling price (optional)</Label>
        <Input inputMode="decimal" placeholder="0.00" />
        <FieldError />
      </TextField>

      <TextField
        name="lowStockThreshold"
        defaultValue={
          d?.lowStockThreshold != null ? String(d.lowStockThreshold) : ""
        }
        validate={(v) => {
          const t = v.trim();
          if (!t) return null;
          const n = Number.parseInt(t, 10);
          return Number.isFinite(n) && n >= 0
            ? null
            : "Non-negative whole number";
        }}
      >
        <Label>Low stock threshold (optional)</Label>
        <Input
          inputMode="numeric"
          placeholder="Uses organization default if empty"
        />
        <FieldError />
      </TextField>

      <div className="flex gap-3 pt-2">
        <Button isDisabled={pending} type="submit" variant="primary">
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </div>
    </Form>
  );
}
