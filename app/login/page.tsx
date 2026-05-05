import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/dashboard");

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
