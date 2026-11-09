import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSession, useLogin } from "../api/hooks.ts";
import { ApiError } from "../api/client.ts";

// Unlock screen for a vault that already exists.
export default function LoginPage() {
  const session = useSession();
  const login = useLogin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (session.data && !session.data.setupComplete)
    return <Navigate to="/setup" replace />;
  if (session.data?.authenticated) return <Navigate to="/" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login.mutate(password, {
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : "Login failed."),
    });
  }

  return (
    <div className="center-screen">
      <div className="card card-narrow">
        <h2>Unlock your vault</h2>
        <form onSubmit={handleSubmit}>
          <label>Master password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={login.isPending}>
            {login.isPending ? "Unlocking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
