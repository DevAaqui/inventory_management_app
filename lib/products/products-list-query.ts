/**
 * /products listing: URL search params (page, q, sort, dir) and helpers to build links.
 */

export type ProductSortColumn =
  | "name"
  | "sku"
  | "quantityOnHand"
  | "isLowStock"
  | "sellingPrice";

/** Rows per page on the product list. */
export const PRODUCTS_PAGE_SIZE = 10;

/** Allowed `sort` query values for the product list. */
export const PRODUCT_SORT_COLUMNS: readonly ProductSortColumn[] = [
  "name",
  "sku",
  "quantityOnHand",
  "isLowStock",
  "sellingPrice",
] as const;

/** Normalized state extracted from `/products?…` query params. */
export type ParsedProductsListQuery = {
  page: number;
  q: string;
  sortColumn: ProductSortColumn;
  sortDescending: boolean;
};

/** Whether `v` is a supported product list sort column. */
export function isProductSortColumn(v: string): v is ProductSortColumn {
  return (PRODUCT_SORT_COLUMNS as readonly string[]).includes(v);
}

/** Parse `page`, `q`, `sort`, and `dir` from a Next/searchParams-style record. */
export function parseProductsListQuery(
  raw: Record<string, string | string[] | undefined>,
): ParsedProductsListQuery {
  const one = (k: string): string | undefined => {
    const v = raw[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };

  const pageRaw = Number.parseInt(one("page") ?? "1", 10);
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const q = (one("q") ?? "").slice(0, 200);

  const sortRaw = one("sort") ?? "name";
  const sortColumn: ProductSortColumn = isProductSortColumn(sortRaw)
    ? sortRaw
    : "name";

  const dirRaw = (one("dir") ?? "asc").toLowerCase();
  const sortDescending = dirRaw === "desc";

  return { page, q, sortColumn, sortDescending };
}

/** Build `/products` path with query string reflecting parsed list state. */
export function productsListHref(q: ParsedProductsListQuery): string {
  const params = new URLSearchParams();
  if (q.page > 1) params.set("page", String(q.page));
  const trimmed = q.q.trim();
  if (trimmed) params.set("q", trimmed);
  if (q.sortColumn !== "name") params.set("sort", q.sortColumn);
  if (q.sortDescending) params.set("dir", "desc");
  const s = params.toString();
  return s ? `/products?${s}` : "/products";
}

/** Same as productsListHref after merging a partial update into `base`. */
export function productsListHrefPatch(
  base: ParsedProductsListQuery,
  patch: Partial<ParsedProductsListQuery>,
): string {
  return productsListHref({ ...base, ...patch });
}
