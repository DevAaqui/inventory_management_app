/** Parse "Adjust stock" form: signed whole-number delta and optional note (FR-5). */
export function parseAdjustStockFormData(formData: FormData):
  | { ok: true; delta: number; note: string | null }
  | { ok: false; error: string } {
  const deltaRaw = String(formData.get("delta") ?? "").trim();
  if (!deltaRaw) {
    return { ok: false, error: "Enter how many units to add or remove (e.g. 5 or -3)" };
  }
  const delta = Number.parseInt(deltaRaw, 10);
  if (!Number.isFinite(delta) || delta === 0) {
    return {
      ok: false,
      error: "Use a non-zero whole number (positive to add, negative to remove)",
    };
  }

  let note: string | null = String(formData.get("note") ?? "").trim();
  if (!note) note = null;
  if (note && note.length > 2000) {
    return { ok: false, error: "Note is too long (max 2000 characters)" };
  }

  return { ok: true, delta, note };
}
