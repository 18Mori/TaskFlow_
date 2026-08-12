"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-zinc-200 transition-colors duration-150 placeholder:text-zinc-600 hover:border-zinc-700 focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/40 sm:h-9";

const invalidInputClasses =
  "h-10 w-full rounded-md border border-rose-500/50 bg-zinc-900/70 px-3 text-sm text-zinc-200 transition-colors duration-150 placeholder:text-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 sm:h-9";

const labelClasses = "mb-1.5 block text-xs font-medium text-zinc-400";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPending, startTransition] = useTransition();

  const validate = (): LoginErrors => {
    const nextErrors: LoginErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) {
      return;
    }

    const redirectTarget =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/tasks";

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrors({
          form:
            error.message === "Invalid login credentials"
              ? "Invalid email or password."
              : error.message,
        });
        return;
      }

      router.push(redirectTarget);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.form && (
        <p
          role="alert"
          className="animate-slide-up rounded-md border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-300"
        >
          {errors.form}
        </p>
      )}

      <label className="block">
        <span className={labelClasses}>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) {
              setErrors((current) => ({ ...current, email: undefined }));
            }
          }}
          placeholder="you@company.com"
          aria-invalid={errors.email ? true : undefined}
          className={errors.email ? invalidInputClasses : inputClasses}
        />
        {errors.email && (
          <p role="alert" className="mt-1.5 text-xs text-rose-400">
            {errors.email}
          </p>
        )}
      </label>

      <label className="block">
        <span className={labelClasses}>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          placeholder="••••••••"
          aria-invalid={errors.password ? true : undefined}
          className={errors.password ? invalidInputClasses : inputClasses}
        />
        {errors.password && (
          <p role="alert" className="mt-1.5 text-xs text-rose-400">
            {errors.password}
          </p>
        )}
      </label>

      {errors.form && (
        <button
          type="button"
          onClick={() => setErrors((current) => ({ ...current, form: undefined }))}
          className="-mt-3 block text-xs text-zinc-500 transition-colors duration-150 hover:text-zinc-300"
        >
          Dismiss
        </button>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <LogIn aria-hidden="true" className="size-4" />
        )}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}