"use client";

import { bulkUploadProductsAction } from "@/app/actions/products";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const TEMPLATE_HREF = "/template/products-import-template.xlsx";

export function BulkUploadProductsButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx")) {
      toast.danger("Invalid file", {
        description: "Please choose an .xlsx workbook.",
      });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await bulkUploadProductsAction(fd);
      if ("error" in result) {
        const desc =
          result.issues && result.issues.length > 0
            ? result.issues
                .slice(0, 5)
                .map((i) => `Row ${i.row}: ${i.message}`)
                .join("\n") + (result.issues.length > 5 ? "\n…" : "")
            : undefined;
        toast.danger(result.error, desc ? { description: desc } : undefined);
        return;
      }
      toast.success("Products imported", {
        description: `${result.created} product(s) added.`,
      });
      router.refresh();
    } catch {
      toast.danger("Import failed", {
        description: "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        className="border-default-200 text-foreground hover:bg-content2/70 inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium"
        download="products-import-template.xlsx"
        href={TEMPLATE_HREF}
      >
        Download template
      </a>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="secondary"
        isDisabled={busy}
        onPress={() => inputRef.current?.click()}
      >
        {busy ? "Importing…" : "Bulk upload"}
      </Button>
    </div>
  );
}
