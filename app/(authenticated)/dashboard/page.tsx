import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-foreground/60 mt-1 text-sm">
        {session.email ? `Signed in as ${session.email}` : null}
      </p>
      <p className="text-foreground/70 mt-6 text-sm">
        Inventory summary and low-stock overview (FR-6) can be added here.
      </p>
    </main>
  );
}
