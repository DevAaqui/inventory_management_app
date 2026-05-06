import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/dashboard");

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/25 absolute -top-40 left-1/2 h-[min(28rem,70vw)] w-[min(48rem,95vw)] -translate-x-1/2 rounded-[50%] blur-3xl dark:bg-primary/35" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/90 to-transparent" />
      </div>
      <LoginForm />
    </main>
  );
}
