"use client";

import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/70 px-3 text-sm text-zinc-200 transition-colors duration-150 placeholder:text-zinc-600 hover:border-zinc-700 focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600/40";

const invalidInputClasses =
  "h-9 w-full rounded-md border border-rose-500/50 bg-zinc-900/70 px-3 text-sm text-zinc-200 transition-colors duration-150 placeholder:text-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30";

const labelClasses = "mb-1.5 block text-xs font-medium text-zinc-400";

interface SignupErrors {
  email?: string;
  password?: string;
  confirm?: string;
  form?: string;
}

export function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validate = (): SignupErrors => {
    const nextErrors: SignupErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match.";
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password || nextErrors.confirm) {
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/tasks`,
        },
      });

      if (error) {
        setErrors({ form: error.message });
        return;
      }

      if (data.session) {
        router.push("/tasks");
        router.refresh();
        return;
      }

      setConfirmationSent(true);
    });
  };

  if (confirmationSent) {
    return (
      <div role="status" className="animate-slide-up space-y-4 text-center">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto size-8 text-emerald-400"
        />
        <div>
          <p className="text-sm font-medium text-zinc-100">Check your inbox</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            We sent a confirmation link to <span className="text-zinc-300">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
        </div>
      </div>
    );
  }

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
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          placeholder="At least 8 characters"
          aria-invalid={errors.password ? true : undefined}
          className={errors.password ? invalidInputClasses : inputClasses}
        />
        {errors.password && (
          <p role="alert" className="mt-1.5 text-xs text-rose-400">
            {errors.password}
          </p>
        )}
      </label>

      <label className="block">
        <span className={labelClasses}>Confirm password</span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value);
            if (errors.confirm) {
              setErrors((current) => ({ ...current, confirm: undefined }));
            }
          }}
          placeholder="Repeat your password"
          aria-invalid={errors.confirm ? true : undefined}
          className={errors.confirm ? invalidInputClasses : inputClasses}
        />
        {errors.confirm && (
          <p role="alert" className="mt-1.5 text-xs text-rose-400">
            {errors.confirm}
          </p>
        )}
      </label>

      <Button
        type="submit"
        variant="primary"
        className="w-full active:scale-[0.98]"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <UserPlus aria-hidden="true" className="size-4" />
        )}
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}