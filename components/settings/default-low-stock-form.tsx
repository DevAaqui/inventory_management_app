"use client";

import {
  type SettingsActionState,
  updateDefaultLowStockAction,
} from "@/app/actions/settings";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

type Props = {
  initialDefaultLowStock: number;
};

const initial: SettingsActionState = {};

export function DefaultLowStockForm({ initialDefaultLowStock }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateDefaultLowStockAction,
    initial,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="border-default-200/90 bg-content1/80 dark:border-default-100 max-w-md rounded-2xl border p-6 shadow-md ring-1 ring-black/[0.03] backdrop-blur-sm dark:bg-content1/60 dark:ring-white/[0.06]">
      <h2 className="text-lg font-semibold tracking-tight">
        Inventory defaults
      </h2>
      <p className="text-foreground/55 mt-2 text-sm leading-relaxed">
        When a product has no low stock threshold, this value is used for low
        stock alerts and the dashboard.
      </p>
      <Form className="mt-6 flex flex-col gap-4" action={formAction}>
        {state.error ? (
          <p className="text-danger text-sm font-medium" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-success text-sm font-medium" role="status">
            Settings saved.
          </p>
        ) : null}
        <TextField
          defaultValue={String(initialDefaultLowStock)}
          isRequired
          name="defaultLowStockThreshold"
          validate={(v) => {
            const t = v.trim();
            if (!t) return "Required";
            const n = Number.parseInt(t, 10);
            return Number.isFinite(n) && n >= 0
              ? null
              : "Enter a non-negative whole number";
          }}
        >
          <Label>Default low stock threshold</Label>
          <Input inputMode="numeric" placeholder="5" />
          <FieldError />
        </TextField>
        <Button className="w-fit" isPending={pending} type="submit">
          Save
        </Button>
      </Form>
    </div>
  );
}
