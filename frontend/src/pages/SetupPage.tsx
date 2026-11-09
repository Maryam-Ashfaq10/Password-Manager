import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSession, useSetup } from "../api/hooks.ts";
import { ApiError } from "../api/client.ts";

// First-run screen: choose the master password. Only shown when no user exists.
export default function SetupPage() {
  const session = useSession();
  const setup = useSetup();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  if (session.data?.setupComplete) return <Navigate to="/login" replace />;
  if (session.data?.authenticated) return <Navigate to="/" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Master password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setup.mutate(password, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "Setup failed."),
    });
  }

  return (
    <div className="center-screen">
      <div className="card card-narrow">
        <h2>Welcome</h2>
        <p className="muted">
          Choose a master password. It unlocks your vault and can’t be recovered
          — so make it strong and memorable.
        </p>
        <form onSubmit={handleSubmit}>
          <label>Master password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <label>Confirm master password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={setup.isPending}>
            {setup.isPending ? "Creating…" : "Create vault"}
          </button>
        </form>
      </div>
    </div>
  );
}
