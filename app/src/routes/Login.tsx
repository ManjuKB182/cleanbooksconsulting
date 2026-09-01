import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LockIcon } from "../components/icons";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function Login() {
  const { session, login, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session) {
    const defaultPath = session.role === "staff_admin" ? "/admin" : "/dashboards";
    const redirectTo = (location.state as { from?: string } | null)?.from ?? defaultPath;
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="auth-mark">CB</span>
        <div className="auth-brand-text">
          <span className="auth-brand-name">CleanBooks</span>
          <span className="auth-brand-tag">Portal</span>
        </div>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-eyebrow">
          <LockIcon width={12} height={12} />
          Secure access
        </span>
        <h1>Portal Login</h1>
        <p className="muted">Sign in to access the workspace assigned to your account.</p>
        <label>
          Email
          <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </label>
        <label>
          Password
          <input type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
