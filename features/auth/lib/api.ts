import { apiBase, requestJson } from "@/features/shared/lib/api-client";
import type { AuthProvider, AuthProviderId, AuthState } from "../types";

export { apiBase };

export function getAuthState() {
  return requestJson<AuthState>("/auth/me");
}

export function getAuthProviders() {
  return requestJson<{ providers: AuthProvider[] }>("/auth/providers");
}

export function devLogin(input: { email: string; name: string }) {
  return requestJson<AuthState>("/auth/dev-login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return requestJson<{ signedOut: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export function startOAuth(provider: AuthProviderId, redirectTo: string) {
  return requestJson<{ provider: AuthProviderId; authorizationUrl: string; state: string; note: string }>(
    `/auth/oauth/${provider}/start`,
    {
      method: "POST",
      body: JSON.stringify({ redirectTo }),
    },
  );
}
