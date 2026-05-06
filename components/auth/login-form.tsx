"use client";

import { loginAction } from "@/app/actions/auth";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useActionState } from "react";

const initial = {} as { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="border-default-200/90 bg-content1/95 dark:border-default-100 relative flex w-full max-w-md flex-col gap-6 rounded-2xl border p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04] backdrop-blur-md dark:bg-content1/90 dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)] dark:ring-white/[0.06]">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="text-foreground/60 mt-2 text-sm leading-relaxed">
          Sign in to your StockFlow account
        </p>
      </div>
      <Form className="flex flex-col gap-4" action={formAction}>
        {state.error ? (
          <p className="text-danger text-sm font-medium" role="alert">
            {state.error}
          </p>
        ) : null}
        <TextField
          isRequired
          name="email"
          type="email"
          validate={(value) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? null
              : "Enter a valid email address"
          }
        >
          <Label>Email</Label>
          <Input placeholder="you@company.com" autoComplete="email" />
          <FieldError />
        </TextField>
        <TextField
          isRequired
          name="password"
          type="password"
          validate={(value) =>
            value.length >= 8 ? null : "At least 8 characters"
          }
        >
          <Label>Password</Label>
          <Input placeholder="••••••••" autoComplete="current-password" />
          <FieldError />
        </TextField>
        <Button
          type="submit"
          className="w-full"
          isDisabled={pending}
          variant="primary"
        >
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </Form>
      <p className="text-foreground/60 text-center text-sm">
        No account?{" "}
        <Link
          className="text-primary font-semibold underline-offset-4 hover:underline focus-visible:ring-primary/40 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          href="/signup"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
