import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCredential, useDeleteCredential } from "../api/hooks.ts";
import CopyButton from "../components/CopyButton.tsx";

// View a single credential: reveal/copy the password, edit, or delete.
export default function DetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCredential(id);
  const del = useDeleteCredential();
  const [reveal, setReveal] = useState(false);

  if (isLoading) return <p className="muted">Loading…</p>;
  if (isError || !data) return <p className="error">Credential not found.</p>;

  function handleDelete() {
    if (!confirm(`Delete the entry for “${data!.website}”?`)) return;
    del.mutate(id, { onSuccess: () => navigate("/") });
  }

  return (
    <>
      <p>
        <Link to="/">← Back to vault</Link>
      </p>
      <div className="card">
        <div className="row-between" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0 }}>{data.website}</h2>
          <div className="row">
            <Link to={`/c/${id}/edit`}>
              <button className="secondary">Edit</button>
            </Link>
            <button
              className="danger"
              onClick={handleDelete}
              disabled={del.isPending}
            >
              Delete
            </button>
          </div>
        </div>

        {data.url && (
          <div className="field">
            <div className="field-label">URL</div>
            <div className="field-value">
              <a href={data.url} target="_blank" rel="noreferrer">
                {data.url}
              </a>
            </div>
          </div>
        )}

        <div className="field">
          <div className="field-label">Username</div>
          <div className="field-value">
            <span>{data.username}</span>
            <CopyButton value={data.username} />
          </div>
        </div>

        <div className="field">
          <div className="field-label">Password</div>
          <div className="field-value">
            <span className="mono">
              {reveal ? data.password : "••••••••••••"}
            </span>
            <button className="icon" onClick={() => setReveal((r) => !r)}>
              {reveal ? "Hide" : "Show"}
            </button>
            <CopyButton value={data.password} />
          </div>
        </div>

        {data.notes && (
          <div className="field">
            <div className="field-label">Notes</div>
            <div className="field-value" style={{ whiteSpace: "pre-wrap" }}>
              {data.notes}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
