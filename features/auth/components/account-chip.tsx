"use client";

import Link from "next/link";
import type { AuthState } from "../types";

export function AccountChip({ auth }: { auth: AuthState }) {
  if (!auth.authenticated || !auth.user) {
    return (
      <Link
        href="/auth"
        className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm font-semibold text-zinc-200 hover:border-white/30"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/auth"
      className="inline-flex min-h-9 items-center rounded-md border border-lime-300/30 bg-lime-300/10 px-3 text-sm font-semibold text-lime-100 hover:border-lime-300/60"
    >
      {auth.user.name}
    </Link>
  );
}
