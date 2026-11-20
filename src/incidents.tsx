import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Incident, IncidentInput, Status, User } from "./types";
import { loadJSON, saveJSON, uid } from "./utils";

type IncidentsContextValue = {
  incidents: Incident[];
  addIncident: (input: IncidentInput, author: User) => void;
  updateStatus: (id: string, status: Status, note: string, admin: User) => void;
};

const IncidentsContext = createContext<IncidentsContextValue | null>(null);
const KEY = "it:incidents";

export function IncidentsProvider({ children }: { children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(() => loadJSON<Incident[]>(KEY, []));

  // Keep everything saved in the browser until the backend exists
  useEffect(() => {
    saveJSON(KEY, incidents);
  }, [incidents]);

  function addIncident(input: IncidentInput, author: User) {
    const now = new Date().toISOString(); // date and time are set automatically
    const incident: Incident = {
      ...input,
      id: uid(),
      createdAt: now,
      authorId: author.id,
      authorName: author.name,
      status: "pending",
      history: [{ status: "pending", at: now, by: "System" }],
    };
    setIncidents((prev) => [incident, ...prev]);
  }

  function updateStatus(id: string, status: Status, note: string, admin: User) {
    // UI-level check only. The real check must happen on the server.
    if (admin.role !== "admin") return;
    const at = new Date().toISOString();
    const cleanNote = note.trim();

    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              history: [...i.history, { status, note: cleanNote || undefined, at, by: admin.name }],
            }
          : i
      )
    );
  }

  return (
    <IncidentsContext.Provider value={{ incidents, addIncident, updateStatus }}>
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidents(): IncidentsContextValue {
  const ctx = useContext(IncidentsContext);
  if (!ctx) throw new Error("useIncidents must be used inside <IncidentsProvider>");
  return ctx;
}
