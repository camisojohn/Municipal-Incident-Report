import { useState } from "react";
import { useAuth } from "./auth";
import Feed from "./Feed";
import IncidentsMap from "./IncidentsMap";

type Tab = "feed" | "map";

export default function Home() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");

  if (!user) return null;
  const isAdmin = user.role === "admin";

  return (
    <div className="app">
      <header className="topbar">
        <div className="container wide topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Incident Tracker
          </div>
          <div className="user">
            <span className={`role ${isAdmin ? "role-admin" : "role-user"}`}>{isAdmin ? "Admin" : "Resident"}</span>
            <span className="user-name">{user.name}</span>
            <button type="button" className="btn sm" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
        <nav className="container wide tabs" aria-label="Main">
          <button type="button" className={`tab ${tab === "feed" ? "active" : ""}`} onClick={() => setTab("feed")}>
            {isAdmin ? "Review queue" : "Feed"}
          </button>
          <button type="button" className={`tab ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>
            Map
          </button>
        </nav>
      </header>

      <main className={`container ${tab === "map" ? "wide" : ""}`}>{tab === "feed" ? <Feed /> : <IncidentsMap />}</main>
    </div>
  );
}
