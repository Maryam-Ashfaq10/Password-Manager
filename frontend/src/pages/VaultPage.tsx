import { useState } from "react";
import { Link } from "react-router-dom";
import { useCredentials } from "../api/hooks.ts";

// Main screen: search bar + list of saved credentials.
export default function VaultPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useCredentials(search);

  return (
    <>
      <div className="row-between" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>Your vault</h2>
        <Link to="/new">
          <button>+ Add</button>
        </Link>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search by website or username…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="muted">Loading…</p>}
      {isError && <p className="error">Couldn’t load your vault.</p>}

      {data && data.length === 0 && (
        <div className="empty">
          {search
            ? "No matches."
            : "No credentials yet. Click “+ Add” to save your first one."}
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="cred-list">
          {data.map((c) => (
            <li key={c.id}>
              <Link
                to={`/c/${c.id}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <div className="cred-item">
                  <div>
                    <div className="website">{c.website}</div>
                    <div className="username">{c.username}</div>
                  </div>
                  <span className="muted">›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
