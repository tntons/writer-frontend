export function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:4001";
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = init?.body
    ? {
        "Content-Type": "application/json",
        ...init.headers,
      }
    : init?.headers;

  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? "The backend could not complete that action.");
  }

  return response.json() as Promise<T>;
}

