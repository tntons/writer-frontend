"use client";

import { useEffect, useState } from "react";
import { devLogin, getAuthProviders, getAuthState, logout, startOAuth } from "../lib/api";
import type { AuthProvider, AuthState } from "../types";

const signedOutState: AuthState = {
  authenticated: false,
  user: null,
  session: null,
  mode: "signed_out",
};

export function useAuthSession() {
  const [auth, setAuth] = useState<AuthState>(signedOutState);
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [email, setEmail] = useState("author@example.com");
  const [name, setName] = useState("Launch Author");
  const [message, setMessage] = useState("Checking session...");
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    try {
      const [authState, providerPayload] = await Promise.all([getAuthState(), getAuthProviders()]);
      setAuth(authState);
      setProviders(providerPayload.providers);
      setMessage(authState.authenticated ? "Session is active." : "Signed out. Use mock OAuth to create a local session.");
    } catch (error) {
      setAuth(signedOutState);
      setMessage(error instanceof Error ? error.message : "Auth backend is unavailable.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function loginWithMock() {
    setIsLoading(true);
    try {
      const authState = await devLogin({ email, name });
      setAuth(authState);
      setMessage("Mock OAuth session created with an HttpOnly backend cookie.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  async function beginOAuth(provider: AuthProvider["id"]) {
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const result = await startOAuth(provider, redirectTo);
      window.location.href = result.authorizationUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start OAuth.");
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    try {
      await logout();
      setAuth(signedOutState);
      setMessage("Signed out and cleared the backend session cookie.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    auth,
    email,
    isLoading,
    message,
    name,
    providers,
    beginOAuth,
    loginWithMock,
    refresh,
    setEmail,
    setName,
    signOut,
  };
}
