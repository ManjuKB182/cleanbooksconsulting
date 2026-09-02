import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { AuthSession } from "./types";

const STORAGE_KEY = "cleanbooks.session";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const result = await api.login(email, password);
      setSession({ accessToken: result.access_token, role: result.role as AuthSession["role"], clientId: result.client_id, email });
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
