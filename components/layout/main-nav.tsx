"use client";

import { cn } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinkBase =
  "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold tracking-tight outline-none transition-[color,background-color,transform,box-shadow] duration-200 active:scale-[0.98] focus-visible:ring-default-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-4";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/settings", label: "Settings" },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <>
      {items.map(({ href, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              navLinkBase,
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/[0.08] dark:bg-content1 dark:ring-white/[0.12]"
                : "text-foreground/75 hover:text-foreground hover:bg-default-200/55",
            )}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
