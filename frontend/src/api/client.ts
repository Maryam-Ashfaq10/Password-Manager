// Thin fetch wrapper. All requests go to /api (proxied to the backend by Vite in
// dev) and include cookies so the session travels with every call.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error || res.statusText);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
