import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CredentialInput } from "../types.ts";

// Shared add/edit form. `initial` prefills fields when editing.
export default function CredentialForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
  error,
}: {
  initial?: Partial<CredentialInput>;
  submitLabel: string;
  onSubmit: (input: CredentialInput) => void;
  pending: boolean;
  error?: string;
}) {
  const navigate = useNavigate();
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ website, url, username, password, notes });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Website / Service *</label>
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="GitHub"
        required
        autoFocus
      />

      <label>URL</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://github.com"
      />

      <label>Username / Email *</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <label>Password *</label>
      <div className="row">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: 0 }}
        />
        <button
          type="button"
          className="icon"
          onClick={() => setShowPassword((s) => !s)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <label style={{ marginTop: "1rem" }}>Notes</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <p className="error">{error}</p>}

      <div className="row">
        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
