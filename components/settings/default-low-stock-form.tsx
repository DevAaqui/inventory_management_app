"use client";

import {
  updateDefaultLowStockAction,
} from "@/app/actions/settings";
import {
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialDefaultLowStock: number;
};

export function DefaultLowStockForm({ initialDefaultLowStock }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Card className="max-w-md shadow-xl shadow-black/[0.08] dark:shadow-black/[0.48]">
      <Card.Header>
        <Card.Title className="text-lg font-semibold tracking-tight">
          Inventory defaults
        </Card.Title>
        <Card.Description className="text-foreground/55 mt-2 text-sm leading-relaxed">
          When a product has no low stock threshold, this value is used for low
          stock alerts and the dashboard.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setPending(true);
            try {
              const next = await updateDefaultLowStockAction(fd);
              if (next.error) {
                toast.danger("Could not save settings", {
                  description: next.error,
                });
                return;
              }
              if (next.success) {
                toast.success("Settings saved", {
                  description:
                    "Default low stock threshold updated for your organization.",
                });
                router.refresh();
              }
            } finally {
              setPending(false);
            }
          }}
        >
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
      </Card.Content>
    </Card>
  );
}
