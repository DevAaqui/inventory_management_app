"use client";

import { logoutAction } from "@/app/actions/auth";
import { Avatar, Dropdown } from "@heroui/react";
import { Header } from "react-aria-components";

export type UserAccountMenuProps = {
  email: string | undefined;
  organizationName: string | undefined;
};

function accountInitials(
  email: string | undefined,
  organizationName: string | undefined,
): string {
  const org = organizationName?.trim();
  if (org) {
    const words = org.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
    }
    const compact = org.replace(/\s+/g, "");
    return (compact.slice(0, 2) || org.slice(0, 2)).toUpperCase();
  }
  const addr = email?.trim().toLowerCase();
  if (addr?.includes("@")) {
    const local = addr.split("@")[0] ?? "";
    const letters = local.replace(/[^a-z]/g, "");
    if (letters.length >= 2) {
      return letters.slice(0, 2).toUpperCase();
    }
    if (local.length >= 1) {
      return local.slice(0, 2).toUpperCase();
    }
  }
  return "?";
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function UserAccountMenu({
  email,
  organizationName,
}: UserAccountMenuProps) {
  const summary =
    organizationName?.trim() || email?.trim() || "Account";
  const initials = accountInitials(email, organizationName);

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Account menu"
        className="border-default-200/90 bg-background/75 text-foreground/85 hover:text-foreground hover:bg-default-100/90 hover:border-default-300/80 data-[pressed]:bg-default-100 shadow-sm ring-black/[0.03] inline-flex h-9 max-w-[min(260px,50vw)] shrink-0 items-center gap-2 rounded-xl border pl-2 pr-3 text-sm font-medium outline-none ring-1 transition-[background-color,border-color,box-shadow,color] dark:bg-background/40 dark:ring-white/[0.06]"
      >
        <Avatar size="sm" className="shrink-0">
          <Avatar.Fallback className="text-[0.65rem] font-bold">
            {initials}
          </Avatar.Fallback>
        </Avatar>
        {/* <ChevronDown className="text-foreground/45 size-4 shrink-0" /> */}
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-[260px]" placement="bottom end">
        <Dropdown.Menu
          aria-label="Account"
          onAction={(key) => {
            if (key === "logout") {
              void logoutAction();
            }
          }}
        >
          <Header className="border-default-200 text-foreground/90 cursor-default border-b px-3 py-3 text-sm outline-none [&+*]:mt-0">
            <dl className="space-y-3">
              <div>
                <dt className="text-foreground/55 text-[0.65rem] font-semibold tracking-wide uppercase">
                  Email
                </dt>
                <dd className="text-foreground mt-0.5 break-all font-normal leading-snug">
                  {email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/55 text-[0.65rem] font-semibold tracking-wide uppercase">
                  Organization
                </dt>
                <dd className="text-foreground mt-0.5 font-normal leading-snug">
                  {organizationName ?? "—"}
                </dd>
              </div>
            </dl>
          </Header>
          <Dropdown.Item
            className="text-danger"
            id="logout"
            textValue="Log out"
          >
            Log out
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
