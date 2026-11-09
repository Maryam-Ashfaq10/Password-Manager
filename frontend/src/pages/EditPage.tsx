import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCredential, useUpdateCredential } from "../api/hooks.ts";
import { ApiError } from "../api/client.ts";
import CredentialForm from "../components/CredentialForm.tsx";

export default function EditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useCredential(id);
  const update = useUpdateCredential(id);
  const [error, setError] = useState("");

  if (isLoading) return <p className="muted">Loading…</p>;
  if (isError || !data) return <p className="error">Credential not found.</p>;

  return (
    <>
      <p>
        <Link to={`/c/${id}`}>← Back</Link>
      </p>
      <div className="card">
        <h2>Edit credential</h2>
        <CredentialForm
          submitLabel="Save changes"
          pending={update.isPending}
          error={error}
          initial={{
            website: data.website,
            url: data.url ?? "",
            username: data.username,
            password: data.password,
            notes: data.notes ?? "",
          }}
          onSubmit={(input) => {
            setError("");
            update.mutate(input, {
              onSuccess: () => navigate(`/c/${id}`),
              onError: (err) =>
                setError(err instanceof ApiError ? err.message : "Save failed."),
            });
          }}
        />
      </div>
    </>
  );
}
