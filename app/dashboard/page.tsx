import { logoutAction } from "@/app/actions/auth";
import { Button } from "@heroui/react";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-foreground/60 mt-1 text-sm">
            {session.organizationName}
            {session.email ? ` · ${session.email}` : null}
          </p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Log out
          </Button>
        </form>
      </header>
      <p className="text-foreground/70 text-sm">
        Product list and inventory summary will appear here.
      </p>
    </main>
  );
}
