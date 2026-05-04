"use client";

import { useEffect, useState } from "react";
import { completeCheckout, createCheckout, createPortal, getBillingAccount, getBillingPlans, topUpCredits } from "../lib/api";
import type { BillingOverview, BillingPlan, BillingPlanId, CheckoutPreview, PortalPreview } from "../types";

export function useBilling() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [checkout, setCheckout] = useState<CheckoutPreview | null>(null);
  const [portal, setPortal] = useState<PortalPreview | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [message, setMessage] = useState("Loading billing workspace...");
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      const [planPayload, accountPayload] = await Promise.all([getBillingPlans(), getBillingAccount()]);
      setPlans(planPayload.plans);
      setOverview(accountPayload);
      setMessage("Billing data loaded from the backend.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load billing.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function startCheckout(planId: BillingPlanId) {
    setIsLoading(true);
    try {
      const preview = await createCheckout(planId);
      setCheckout(preview);
      setMessage(`Mock checkout session opened for ${preview.plan.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  async function completeLatestCheckout() {
    if (!checkout) return;
    setIsLoading(true);
    try {
      const result = await completeCheckout(checkout.sessionId);
      setOverview(result.billing);
      setCheckout((current) => (current ? { ...current, checkoutSession: result.checkoutSession } : current));
      setMessage("Mock checkout completed and credits were granted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete checkout.");
    } finally {
      setIsLoading(false);
    }
  }

  async function openPortal() {
    setIsLoading(true);
    try {
      const preview = await createPortal();
      setPortal(preview);
      setMessage("Mock customer portal preview created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create portal preview.");
    } finally {
      setIsLoading(false);
    }
  }

  async function addCredits() {
    setIsLoading(true);
    try {
      const nextOverview = await topUpCredits(topUpAmount, "Frontend mock top-up");
      setOverview(nextOverview);
      setMessage(`${topUpAmount.toLocaleString()} credits added in mock billing.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to add credits.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
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
    refresh,
    setTopUpAmount,
    startCheckout,
  };
}
