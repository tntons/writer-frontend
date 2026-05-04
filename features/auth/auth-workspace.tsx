"use client";

import Link from "next/link";
import { Loader2, LogOut, ShieldCheck } from "lucide-react";
import { apiBase } from "./lib/api";
import { useAuthSession } from "./hooks/use-auth-session";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AuthWorkspace() {
  const {
    auth,
    email,
    isLoading,
    message,
    name,
    providers,
    beginOAuth,
    loginWithMock,
    setEmail,
    setName,
    signOut,
  } = useAuthSession();

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-6 text-zinc-100 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
          <Link href="/" className="text-xs font-medium uppercase text-lime-200">
            WriterBridge
          </Link>
          <h1 className="mt-4 text-3xl font-semibold text-white">Account</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            OAuth is handled by the backend. No provider secrets live in the frontend repo.
          </p>
          <div className="mt-5 rounded-md border border-white/10 bg-black p-3">
            <p className="text-xs font-medium uppercase text-zinc-500">Backend</p>
            <p className="mt-2 break-all text-xs text-zinc-500">{apiBase()}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-300" aria-live="polite">
              {message}
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">Session</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {auth.authenticated && auth.user ? auth.user.name : "Sign in to your writer workspace"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {auth.authenticated && auth.user
                    ? `${auth.user.email} is connected with ${auth.session?.provider ?? "session"} auth.`
                    : "Use the local mock OAuth session today, then connect Google or GitHub credentials before launch."}
                </p>
              </div>
              <span
                className={classNames(
                  "rounded-md border px-2 py-1 text-xs font-semibold",
                  auth.authenticated
                    ? "border-lime-300/40 bg-lime-300/10 text-lime-100"
                    : "border-white/10 bg-white/[0.04] text-zinc-400",
                )}
              >
                {auth.authenticated ? "signed in" : "signed out"}
              </span>
            </div>

            {auth.authenticated ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/journey"
                  className="inline-flex h-10 items-center rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200"
                >
                  Continue to workspace
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  disabled={isLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-lime-200" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-white">Mock OAuth</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Creates a server-side session and HttpOnly cookie without any OAuth secret keys.
              </p>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-zinc-500">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                />
              </label>
              <label className="mt-4 block">
                <span className="text-xs font-medium text-zinc-500">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300/60"
                />
              </label>
              <button
                type="button"
                onClick={loginWithMock}
                disabled={isLoading}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-lime-300 px-4 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Continue with mock OAuth
              </button>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
              <h3 className="text-lg font-semibold text-white">Provider wiring</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                These routes exist now. Google and GitHub stay disabled until client IDs and secrets are configured.
              </p>
              <div className="mt-4 grid gap-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => beginOAuth(provider.id)}
                    disabled={isLoading || (provider.id !== "mock" && !provider.configured)}
                    className="rounded-md border border-white/10 bg-black p-3 text-left hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">Continue with {provider.label}</span>
                      <span className="text-xs text-zinc-500">{provider.configured ? "ready" : "needs env"}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{provider.loginHint}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
