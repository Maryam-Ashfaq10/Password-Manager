import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./client.ts";
import type {
  CredentialDetail,
  CredentialInput,
  CredentialListItem,
  SessionState,
} from "../types.ts";

// ---- Session ----------------------------------------------------------------

/** Combined auth state: has setup happened, and are we logged in? */
export function useSession() {
  return useQuery<SessionState>({
    queryKey: ["session"],
    queryFn: async () => {
      const { setupComplete } = await api<{ setupComplete: boolean }>(
        "/auth/status",
      );
      let authenticated = false;
      try {
        await api("/auth/me");
        authenticated = true;
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) throw err;
      }
      return { setupComplete, authenticated };
    },
    retry: false,
    staleTime: 30_000,
  });
}

export function useSetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (masterPassword: string) =>
      api("/auth/setup", {
        method: "POST",
        body: JSON.stringify({ masterPassword }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["session"] }),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (masterPassword: string) =>
      api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ masterPassword }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["session"] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: () => qc.clear(),
  });
}

// ---- Credentials ------------------------------------------------------------

export function useCredentials(search: string) {
  const q = search.trim();
  return useQuery<CredentialListItem[]>({
    queryKey: ["credentials", q],
    queryFn: () =>
      api(`/credentials${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  });
}

export function useCredential(id: string) {
  return useQuery<CredentialDetail>({
    queryKey: ["credential", id],
    queryFn: () => api(`/credentials/${id}`),
  });
}

export function useCreateCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CredentialInput) =>
      api<CredentialListItem>("/credentials", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}

export function useUpdateCredential(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CredentialInput>) =>
      api<CredentialListItem>(`/credentials/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      qc.invalidateQueries({ queryKey: ["credential", id] });
    },
  });
}

export function useDeleteCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/credentials/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["credentials"] }),
  });
}
