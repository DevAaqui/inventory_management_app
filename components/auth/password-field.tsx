"use client";

import {
  Button,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { useState } from "react";

export type PasswordFieldProps = {
  autoComplete?: string;
  isRequired?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  validate?: (value: string) => string | null;
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M10.733 5.076A10.744 10.744 0 0 1 12 5c6.364 0 10 7 10 7a18.991 18.991 0 0 1-4.307 5.107" />
      <path d="M14.122 14.122A3 3 0 0 1 9.88 9.88" />
      <path d="M6.343 6.343A14.17 14.17 0 0 0 2 12s3.636 7 10 7a9.74 9.74 0 0 0 4.917-1.343" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

export function PasswordField({
  autoComplete,
  isRequired,
  label,
  name,
  placeholder = "••••••••",
  validate,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      isRequired={isRequired}
      name={name}
      type={visible ? "text" : "password"}
      validate={validate}
    >
      <Label>{label}</Label>
      <InputGroup>
        <InputGroup.Input autoComplete={autoComplete} placeholder={placeholder} />
        <InputGroup.Suffix className="border-none bg-transparent pr-1">
          <Button
            aria-label={visible ? "Hide password" : "Show password"}
            className="text-foreground/55 hover:text-foreground/90"
            isIconOnly
            size="sm"
            type="button"
            variant="ghost"
            onPress={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOffIcon className="size-[1.125rem]" /> : <EyeIcon className="size-[1.125rem]" />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
      <FieldError />
    </TextField>
  );
}
