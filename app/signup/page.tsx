import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account · Taskflow",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Your workspace in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-300 underline-offset-4 transition-colors duration-150 hover:text-zinc-100 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}