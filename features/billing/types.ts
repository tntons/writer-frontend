export type BillingPlanId = "starter" | "pro" | "studio";

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  description: string;
  monthlyCredits: number;
  priceLabel: string;
  stripePriceId: string;
};

export type BillingAccount = {
  userId: string;
  planId: BillingPlanId;
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled" | "mock";
  creditBalance: number;
  monthlyGrant: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  updatedAt: string;
};

export type CreditLedgerEntry = {
  id: string;
  kind: string;
  amount: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
};

export type BillingOverview = {
  account: BillingAccount;
  plan: BillingPlan;
  availableCredits: number;
  monthlyGrant: number;
  recentLedger: CreditLedgerEntry[];
};

export type CheckoutPreview = {
  mode: "checkout";
  sessionId: string;
  checkoutUrl: string;
  plan: BillingPlan;
  checkoutSession: {
    id: string;
    status: "open" | "completed" | "expired" | "canceled";
    stripeSessionId: string;
  };
};

export type PortalPreview = {
  mode: "portal";
  portalUrl: string;
  account: BillingAccount;
  plan: BillingPlan;
  actions: string[];
};
