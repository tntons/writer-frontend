"use client";

import Link from "next/link";
import { CreditCard, Loader2, ReceiptText, WalletCards } from "lucide-react";
import { useBilling } from "./hooks/use-billing";
import type { BillingPlan } from "./types";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function PlanCard({
  active,
  isLoading,
  plan,
  onCheckout,
}: {
  active: boolean;
  isLoading: boolean;
  plan: BillingPlan;
  onCheckout: () => void;
}) {
  return (
    <article
      className={classNames(
        "rounded-lg border bg-[#0d0d0d] p-5",
        active ? "border-lime-300/50" : "border-white/10",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{plan.description}</p>
        </div>
        {active ? (
          <span className="rounded-md border border-lime-300/40 bg-lime-300/10 px-2 py-1 text-xs font-semibold text-lime-100">
            current
          </span>
        ) : null}
      </div>
      <p className="mt-5 text-3xl font-semibold text-white">{plan.priceLabel}</p>
      <p className="mt-1 text-sm text-zinc-500">{plan.monthlyCredits.toLocaleString()} credits per month</p>
      <button
        type="button"
        onClick={onCheckout}
        disabled={isLoading}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-lime-300 px-3 text-sm font-semibold text-black hover:bg-lime-200 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
        Start mock checkout
      </button>
    </article>
  );
}

export function BillingWorkspace() {
  const {
    checkout,
    isLoading,
    message,
    overview,
    plans,
    portal,
    topUpAmount,
    addCredits,
    completeLatestCheckout,
    openPortal,
    setTopUpAmount,
    startCheckout,
  } = useBilling();

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-6 text-zinc-100 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="text-xs font-medium uppercase text-lime-200">
              WriterBridge
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-white">Billing</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Subscription, credits, checkout, and portal flows are wired as mock backend sessions. No Stripe secret key is stored yet.
            </p>
          </div>
          <Link
            href="/auth"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30"
          >
            Account
          </Link>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <p className="text-xs font-medium uppercase text-zinc-500">Current plan</p>
            <p className="mt-2 text-2xl font-semibold text-white">{overview?.plan.name ?? "Loading"}</p>
            <p className="mt-1 text-sm text-zinc-500">{overview?.account.subscriptionStatus ?? "checking"}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <p className="text-xs font-medium uppercase text-zinc-500">Credits</p>
            <p className="mt-2 text-2xl font-semibold text-white">{overview?.availableCredits.toLocaleString() ?? "..."}</p>
            <p className="mt-1 text-sm text-zinc-500">{overview?.monthlyGrant.toLocaleString() ?? "..."} monthly grant</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <p className="text-xs font-medium uppercase text-zinc-500">Status</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300" aria-live="polite">
              {message}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              active={overview?.account.planId === plan.id}
              isLoading={isLoading}
              plan={plan}
              onCheckout={() => startCheckout(plan.id)}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-lime-200" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-white">Mock checkout session</h2>
            </div>
            {checkout ? (
              <div className="mt-4 rounded-md border border-white/10 bg-black p-4">
                <p className="text-sm font-semibold text-white">{checkout.plan.name} checkout</p>
                <p className="mt-2 break-all text-xs text-zinc-500">{checkout.checkoutUrl}</p>
                <p className="mt-2 text-xs text-zinc-500">Status: {checkout.checkoutSession.status}</p>
                <button
                  type="button"
                  onClick={completeLatestCheckout}
                  disabled={isLoading || checkout.checkoutSession.status !== "open"}
                  className="mt-4 inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                  Complete mock checkout
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-500">Choose a plan to create a Stripe-shaped mock checkout session.</p>
            )}

            <div className="mt-5 rounded-md border border-white/10 bg-black p-4">
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-lime-200" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">Portal and top-up</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openPortal}
                  disabled={isLoading}
                  className="h-10 rounded-md border border-white/10 px-4 text-sm font-semibold text-zinc-200 hover:border-white/30 disabled:opacity-50"
                >
                  Create portal preview
                </button>
                <input
                  type="number"
                  min={1}
                  value={topUpAmount}
                  onChange={(event) => setTopUpAmount(Number(event.target.value))}
                  className="h-10 w-32 rounded-md border border-white/10 bg-[#050505] px-3 text-sm text-white outline-none focus:border-lime-300/60"
                />
                <button
                  type="button"
                  onClick={addCredits}
                  disabled={isLoading}
                  className="h-10 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                  Add credits
                </button>
              </div>
              {portal ? <p className="mt-3 break-all text-xs text-zinc-500">{portal.portalUrl}</p> : null}
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-[#0d0d0d] p-5">
            <p className="text-xs font-medium uppercase text-zinc-500">Recent ledger</p>
            <div className="mt-4 grid gap-3">
              {overview?.recentLedger.map((entry) => (
                <div key={entry.id} className="rounded-md border border-white/10 bg-black p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{entry.kind}</p>
                    <p className="text-sm text-lime-100">{entry.amount.toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">{entry.note}</p>
                </div>
              )) ?? <p className="text-sm text-zinc-500">No ledger yet.</p>}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
