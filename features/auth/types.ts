export type AuthProviderId = "mock" | "google" | "github";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  provider: AuthProviderId;
  expiresAt: string;
};

export type AuthState = {
  authenticated: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  mode?: string;
};

export type AuthProvider = {
  id: AuthProviderId;
  label: string;
  configured: boolean;
  loginHint: string;
};
