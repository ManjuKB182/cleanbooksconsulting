import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewClient() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      const client = await api.createClient(session.accessToken, name, slug);
      toast.success(`${client.name} onboarded`);
      navigate(`/admin/clients/${client.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create client.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Onboard a client</h1>
      <p className="muted">
        Step 1 of the onboarding flow: create the client record. Dashboard access and their Gmail connection
        happen next, on the client's detail page.
      </p>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Client name
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </label>
        <label>
          Slug
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create client"}
        </button>
      </form>
    </div>
  );
}
