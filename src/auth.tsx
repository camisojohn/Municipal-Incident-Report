import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "./types";
import { loadJSON, saveJSON } from "./utils";

/*
  DEMO AUTH ONLY.
  Anyone can pick "admin" here, so this is NOT secure. It exists so we can build
  and test both roles before the backend. In milestone 3, real accounts and the
  admin role come from the server, and the server checks the role on every request.
*/

type AuthContextValue = {
  user: User | null;
  signInResident: (name: string) => void;
  signInAdmin: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const KEY = "it:user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadJSON<User | null>(KEY, null));

  function update(next: User | null) {
    setUser(next);
    saveJSON(KEY, next);
  }

  function signInResident(name: string) {
    const clean = name.trim();
    update({
      id: "resident-" + clean.toLowerCase().replace(/\s+/g, "-"),
      name: clean,
      role: "user",
    });
  }

  function signInAdmin() {
    update({ id: "admin-1", name: "Municipal Admin", role: "admin" });
  }

  function signOut() {
    update(null);
  }

  return (
    <AuthContext.Provider value={{ user, signInResident, signInAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
