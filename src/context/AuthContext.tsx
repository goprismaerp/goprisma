"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  username: string;
  nome: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  carregando: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const PUBLIC_ROUTES = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      try {
        const data = JSON.parse(atob(t));
        setUser(data);
        setToken(t);
      } catch {
        localStorage.removeItem("token");
      }
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (carregando) return;
    if (!token && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
    }
  }, [token, carregando, pathname, router]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Erro ao fazer login";
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-400 border-t-zinc-800 rounded-full" />
      </div>
    );
  }

  if (!token && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);