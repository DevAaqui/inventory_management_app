import { logoutAction } from "@/app/actions/auth";
import { getSession } from "@/lib/session";
import { Button } from "@heroui/react";
import Image from "next/image";
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
      <header className="border-default-200 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard"
            className="relative h-8 w-[min(200px,68vw)] shrink-0 sm:h-9 sm:w-[min(220px,42vw)]"
            aria-label="StockFlow — Home"
          >
            <Image
              src="/stock_flow1.png"
              alt=""
              fill
              className="object-contain object-left"
              sizes="(max-width: 640px) 68vw, 220px"
              priority
            />
          </Link>
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
