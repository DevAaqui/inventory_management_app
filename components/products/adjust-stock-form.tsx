"use client";

import { adjustStockAction } from "@/app/actions/products";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: string;
  currentQuantityOnHand: number;
};

export function AdjustStockForm({
  productId,
  currentQuantityOnHand,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setPending(true);
        const result = await adjustStockAction(productId, fd);
        setPending(false);
        if ("error" in result) {
          toast.danger("Could not adjust stock", { description: result.error });
          return;
        }
        toast.success("Stock updated", {
          description: `Quantity on hand is now ${result.quantityOnHand}.`,
        });
        form.reset();
        router.refresh();
      }}
    >
      <p className="text-foreground/70 text-sm">
        Current quantity on hand:{" "}
        <span className="text-foreground font-medium">
          {currentQuantityOnHand}
        </span>
        . Enter a positive number to add units or a negative number to remove
        (e.g. <code className="text-xs">10</code> or{" "}
        <code className="text-xs">-3</code>).
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="adjust-stock-delta">
          Add / remove units
        </label>
        <input
          required
          autoComplete="off"
          className="border-default-200 focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
          id="adjust-stock-delta"
          inputMode="text"
          name="delta"
          placeholder="e.g. 5 or -2"
          type="text"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="adjust-stock-note">
          Note (optional)
        </label>
        <textarea
          className="border-default-200 focus:border-primary min-h-[72px] w-full rounded-lg border px-3 py-2 text-sm outline-none"
          id="adjust-stock-note"
          name="note"
          placeholder="Reason or reference for this change"
        />
      </div>

      <Button isDisabled={pending} type="submit" variant="secondary">
        {pending ? "Applying…" : "Apply adjustment"}
      </Button>
    </form>
  );
}
