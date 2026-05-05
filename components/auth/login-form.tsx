"use client";

import { loginAction } from "@/app/actions/auth";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useActionState } from "react";

const initial = {} as { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="border-default-200 dark:border-default-100 bg-content1 flex w-full max-w-md flex-col gap-6 rounded-xl border p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="text-foreground/60 mt-1 text-sm">
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
        <Link className="text-primary font-medium underline" href="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
