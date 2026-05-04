import { requestJson } from "@/features/shared/lib/api-client";
import type { BillingOverview, BillingPlan, BillingPlanId, CheckoutPreview, PortalPreview } from "../types";

export function getBillingPlans() {
  return requestJson<{ plans: BillingPlan[] }>("/billing/plans");
}

export function getBillingAccount() {
  return requestJson<BillingOverview>("/billing/account");
}

export function createCheckout(planId: BillingPlanId) {
  return requestJson<CheckoutPreview>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export function completeCheckout(sessionId: string) {
  return requestJson<{ checkoutSession: CheckoutPreview["checkoutSession"]; billing: BillingOverview }>(
    `/billing/checkout/${sessionId}/complete`,
    { method: "POST" },
  );
}

export function createPortal() {
  return requestJson<PortalPreview>("/billing/portal", {
    method: "POST",
  });
}

export function topUpCredits(credits: number, note: string) {
  return requestJson<BillingOverview>("/billing/credits/top-up", {
    method: "POST",
    body: JSON.stringify({ credits, note }),
  });
}
