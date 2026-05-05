"use client";

import { toast } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * After create/update redirect (`?saved=created` | `?saved=updated`), show a toast and drop the param.
 */
export function ProductsSavedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const consumedRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (saved !== "created" && saved !== "updated") {
      consumedRef.current = null;
      return;
    }
    if (consumedRef.current === saved) return;
    consumedRef.current = saved;

    const title =
      saved === "created" ? "Product created" : "Product updated";
    toast.success(title, {
      description: "Your changes have been saved.",
    });
    router.replace(pathname);
  }, [searchParams, router, pathname]);

  return null;
}
