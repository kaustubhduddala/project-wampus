import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  role: "USER" | "ADMIN" | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const API_BASE = "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("pjw_token");
    const storedUser = localStorage.getItem("pjw_user");
    const storedRole = localStorage.getItem("pjw_role");
    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole as "USER" | "ADMIN");
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Login failed" };
      }

      const authUser: AuthUser = { id: data.user.id, email: data.user.email };
      const authRole = data.role as "USER" | "ADMIN";

      setUser(authUser);
      setRole(authRole);
      setToken(data.token);

      localStorage.setItem("pjw_token", data.token);
      localStorage.setItem("pjw_user", JSON.stringify(authUser));
      localStorage.setItem("pjw_role", authRole);

      return {};
    } catch {
      return { error: "Could not connect to server" };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem("pjw_token");
    localStorage.removeItem("pjw_user");
    localStorage.removeItem("pjw_role");
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
