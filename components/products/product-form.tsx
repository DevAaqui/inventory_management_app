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
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";

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

function requiredFieldsValid(
  name: string,
  sku: string,
  quantityOnHand: string,
): boolean {
  if (!name.trim() || !sku.trim()) return false;
  const q = Number.parseInt(quantityOnHand.trim(), 10);
  return Number.isFinite(q) && q >= 0;
}

export function ProductForm({ mode, defaultValues, formAction }: Props) {
  const [state, dispatch, pending] = useActionState(formAction, initial);

  const d = defaultValues;
  const [name, setName] = useState(() => d?.name ?? "");
  const [sku, setSku] = useState(() => d?.sku ?? "");
  const [quantityOnHand, setQuantityOnHand] = useState(() =>
    d?.quantityOnHand !== undefined ? String(d.quantityOnHand) : "0",
  );

  useEffect(() => {
    setName(d?.name ?? "");
    setSku(d?.sku ?? "");
    setQuantityOnHand(
      d?.quantityOnHand !== undefined ? String(d.quantityOnHand) : "0",
    );
  }, [d?.name, d?.sku, d?.quantityOnHand]);

  const canSubmit = useMemo(
    () => requiredFieldsValid(name, sku, quantityOnHand),
    [name, sku, quantityOnHand],
  );

  return (
    <div className="border-default-200/90 bg-content1/75 dark:border-default-100 max-w-xl rounded-2xl border p-6 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm md:p-8 dark:bg-content1/55 dark:ring-white/[0.06]">
      <Form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => {
          dispatch(fd);
        });
      }}
    >
      {state.error ? (
        <p className="text-danger text-sm font-medium" role="alert">
          {state.error}
        </p>
      ) : null}

      <TextField
        isRequired
        name="name"
        value={name}
        onChange={setName}
        validate={(v) => (v.trim().length > 0 ? null : "Name is required")}
      >
        <Label>Name</Label>
        <Input placeholder="Product name" />
        <FieldError />
      </TextField>

      <TextField
        isRequired
        name="sku"
        value={sku}
        onChange={setSku}
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
        value={quantityOnHand}
        onChange={setQuantityOnHand}
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
        <Button
          isDisabled={pending || !canSubmit}
          type="submit"
          variant="primary"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </div>
    </Form>
    </div>
  );
}
