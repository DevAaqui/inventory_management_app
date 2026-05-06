import { UserAccountMenu } from "@/components/layout/user-account-menu";
import { getSession } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const navLinkClass =
  "text-foreground/75 hover:text-foreground shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold tracking-tight outline-none transition-[color,background-color,transform] duration-200 hover:bg-default-200/55 active:scale-[0.98] focus-visible:ring-default-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-4";

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
      <header className="border-default-200/80 bg-background/80 sticky top-0 z-40 flex flex-col gap-3 border-b px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/65 md:flex-row md:items-center md:gap-6 md:py-2.5 lg:justify-between dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex min-w-0 items-center justify-between gap-3 md:contents">
          <Link
            href="/dashboard"
            className="relative h-8 max-w-[200px] min-w-0 flex-1 transition-opacity hover:opacity-90 sm:h-9 sm:max-w-[220px] md:order-1 md:h-9 md:w-[min(220px,38vw)] md:max-w-[min(220px,38vw)] md:flex-none"
            aria-label="StockFlow — Home"
          >
            <Image
              src="/stock_flow1.png"
              alt=""
              fill
              className="object-contain object-left"
              sizes="(max-width: 768px) 45vw, 220px"
              priority
            />
          </Link>
          <div className="shrink-0 md:order-3">
            <UserAccountMenu
              email={session.email}
              organizationName={session.organizationName}
            />
          </div>
        </div>
        <nav
          aria-label="Main navigation"
          className="text-foreground/80 -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-0.5 [scrollbar-width:none] md:order-2 md:mx-0 md:min-w-0 md:flex-1 md:justify-center md:gap-1 md:overflow-visible md:rounded-full md:bg-default-100/65 md:p-1 md:shadow-inner dark:md:bg-default-50/15 lg:justify-start [&::-webkit-scrollbar]:hidden"
        >
          <Link className={navLinkClass} href="/dashboard">
            Dashboard
          </Link>
          <Link className={navLinkClass} href="/products">
            Products
          </Link>
          <Link className={navLinkClass} href="/settings">
            Settings
          </Link>
        </nav>
      </header>
      <div className="from-primary/[0.045] dark:from-primary/[0.07] relative flex min-h-0 flex-1 flex-col bg-linear-to-b via-background to-background">
        {children}
      </div>
    </div>
  );
}
