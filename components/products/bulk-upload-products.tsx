"use client";

import { bulkUploadProductsAction } from "@/app/actions/products";
import { Button, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const TEMPLATE_HREF = "/template/products-import-template.xlsx";

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {/* Tray + arrow pointing down (stem top → chevron at opening above tray) */}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

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
        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 inline-flex items-center gap-1.5 rounded-md text-sm font-medium underline underline-offset-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        download="products-import-template.xlsx"
        href={TEMPLATE_HREF}
      >
        <DownloadIcon className="size-4 shrink-0" />
        Excel template
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
        size="md"
        isDisabled={busy}
        onPress={() => inputRef.current?.click()}
      >
        <UploadIcon className="size-4 shrink-0" /> {busy ? "Importing…" : "Bulk upload"}
      </Button>
    </div>
  );
}
