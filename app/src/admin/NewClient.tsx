import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon } from "../components/icons";
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
      <Link to="/admin" className="breadcrumb">
        <ArrowLeftIcon />
        Clients
      </Link>
      <h1>Onboard a client</h1>
      <p className="muted">Create the client record, then connect their mailbox and turn on dashboards from the detail page.</p>

      <div className="onboard-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <label>
            Client name
            <input
              required
              autoFocus
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

        <ol className="steps-panel">
          <li className="steps-item steps-item-current">
            <span className="steps-index">1</span>
            <div>
              <p className="steps-title">Create the client</p>
              <p className="steps-desc">Name and a URL-friendly slug — that's all it takes to get started.</p>
            </div>
          </li>
          <li className="steps-item">
            <span className="steps-index">2</span>
            <div>
              <p className="steps-title">Connect their mailbox</p>
              <p className="steps-desc">Authorize Gmail so ingestion can start pulling statements and invoices.</p>
            </div>
          </li>
          <li className="steps-item">
            <span className="steps-index">3</span>
            <div>
              <p className="steps-title">Turn on dashboards</p>
              <p className="steps-desc">Enable the reports this client should see — the rest stay hidden.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
