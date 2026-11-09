// Shapes returned by the backend API.

export interface CredentialListItem {
  id: string;
  website: string;
  url: string | null;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialDetail extends CredentialListItem {
  password: string;
  notes: string | null;
}

export interface CredentialInput {
  website: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export interface SessionState {
  setupComplete: boolean;
  authenticated: boolean;
}
