import { logoutAction } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { Button } from "@heroui/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.organizationId) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-default-200 flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-semibold">StockFlow</span>
          <nav className="text-foreground/80 flex gap-4 text-sm font-medium">
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-foreground" href="/products">
              Products
            </Link>
            <Link className="hover:text-foreground" href="/settings">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className="text-foreground/60 max-w-[220px] truncate"
            title={session.organizationName ?? undefined}
          >
            {session.organizationName}
          </span>
          <form action={logoutAction}>
            <Button size="sm" type="submit" variant="secondary">
              Log out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
