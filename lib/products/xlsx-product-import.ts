import type { Buffer as NodeBuffer } from "node:buffer";
import { Readable } from "node:stream";
import ExcelJS from "exceljs";
import type { CreateProductInput } from "@/lib/db/product-repository";
import { parseProductFormData } from "./parse-product-form";

const MAX_DATA_ROWS = 1000;

/** Normalize spreadsheet header text to a key for lookup. */
function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Map normalized header → FormData field name used by `parseProductFormData`. */
const HEADER_TO_FORM_FIELD: Record<string, string> = {
  name: "name",
  "product name": "name",
  sku: "sku",
  description: "description",
  "quantity on hand": "quantityOnHand",
  qty: "quantityOnHand",
  quantity: "quantityOnHand",
  "cost price": "costPrice",
  cost: "costPrice",
  "selling price": "sellingPrice",
  sell: "sellingPrice",
  price: "sellingPrice",
  "low stock threshold": "lowStockThreshold",
  "low stock": "lowStockThreshold",
  threshold: "lowStockThreshold",
};

const REQUIRED_FORM_FIELDS = ["name", "sku", "quantityOnHand"] as const;

function cellToString(cell: ExcelJS.Cell | null | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) {
    return "";
  }
  const v = cell.value;
  if (typeof v === "string") {
    return v.trim();
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (typeof v === "boolean") {
    return v ? "true" : "false";
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "object") {
    if ("result" in v && v.result != null) {
      return cellToString({ value: v.result } as ExcelJS.Cell);
    }
    if ("text" in v && typeof (v as { text: string }).text === "string") {
      return (v as { text: string }).text.trim();
    }
    if (
      "richText" in v &&
      Array.isArray((v as { richText: { text: string }[] }).richText)
    ) {
      return (v as { richText: { text: string }[] })
        .richText.map((r) => r.text)
        .join("")
        .trim();
    }
  }
  return String(v).trim();
}

export type XlsxParseResult =
  | { ok: true; items: CreateProductInput[] }
  | {
      ok: false;
      error: string;
      issues?: { row: number; message: string }[];
    };

export async function parseProductsXlsxBuffer(
  buffer: NodeBuffer,
): Promise<XlsxParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.read(Readable.from(buffer));

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { ok: false, error: "The workbook has no sheets." };
  }

  const headerRow = sheet.getRow(1);
  const colToField = new Map<number, string>();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const norm = normalizeHeader(cellToString(cell));
    const field = HEADER_TO_FORM_FIELD[norm];
    if (field) {
      colToField.set(colNumber, field);
    }
  });

  const present = new Set(colToField.values());
  for (const req of REQUIRED_FORM_FIELDS) {
    if (!present.has(req)) {
      return {
        ok: false,
        error: `Missing required column for "${req}". Use headers such as Name, SKU, and Quantity (or Quantity on hand).`,
      };
    }
  }

  const issues: { row: number; message: string }[] = [];
  const items: CreateProductInput[] = [];
  const seenSku = new Set<string>();

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const raw: Record<string, string> = {};
    colToField.forEach((field, colNumber) => {
      raw[field] = cellToString(row.getCell(colNumber));
    });

    const name = (raw.name ?? "").trim();
    const sku = (raw.sku ?? "").trim();
    if (!name && !sku) {
      return;
    }

    const fd = new FormData();
    fd.set("name", raw.name ?? "");
    fd.set("sku", raw.sku ?? "");
    fd.set("description", raw.description ?? "");
    fd.set("quantityOnHand", raw.quantityOnHand ?? "");
    fd.set("costPrice", raw.costPrice ?? "");
    fd.set("sellingPrice", raw.sellingPrice ?? "");
    fd.set("lowStockThreshold", raw.lowStockThreshold ?? "");

    const parsed = parseProductFormData(fd);
    if (!parsed.ok) {
      issues.push({ row: rowNumber, message: parsed.error });
      return;
    }

    if (seenSku.has(parsed.data.sku)) {
      issues.push({
        row: rowNumber,
        message: `Duplicate SKU in file: ${parsed.data.sku}`,
      });
      return;
    }
    seenSku.add(parsed.data.sku);
    items.push(parsed.data);
  });

  if (items.length > MAX_DATA_ROWS) {
    return {
      ok: false,
      error: `Too many data rows (max ${MAX_DATA_ROWS}). Split into multiple files.`,
    };
  }

  if (issues.length > 0) {
    return {
      ok: false,
      error: `${issues.length} row(s) failed validation. Fix the spreadsheet and try again.`,
      issues,
    };
  }

  if (items.length === 0) {
    return {
      ok: false,
      error: "No product rows found. Add data below the header row.",
    };
  }

  return { ok: true, items };
}
