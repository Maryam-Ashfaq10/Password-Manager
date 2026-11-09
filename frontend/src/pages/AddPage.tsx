import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateCredential } from "../api/hooks.ts";
import { ApiError } from "../api/client.ts";
import CredentialForm from "../components/CredentialForm.tsx";

export default function AddPage() {
  const navigate = useNavigate();
  const create = useCreateCredential();
  const [error, setError] = useState("");

  return (
    <>
      <p>
        <Link to="/">← Back to vault</Link>
      </p>
      <div className="card">
        <h2>Add credential</h2>
        <CredentialForm
          submitLabel="Save"
          pending={create.isPending}
          error={error}
          onSubmit={(input) => {
            setError("");
            create.mutate(input, {
              onSuccess: () => navigate("/"),
              onError: (err) =>
                setError(err instanceof ApiError ? err.message : "Save failed."),
            });
          }}
        />
      </div>
    </>
  );
}
